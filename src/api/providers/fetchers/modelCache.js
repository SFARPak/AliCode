"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.flushModels = exports.refreshModels = exports.getModels = void 0
exports.initializeModelCacheRefresh = initializeModelCacheRefresh
exports.getModelsFromCache = getModelsFromCache
const path = __importStar(require("path"))
const promises_1 = __importDefault(require("fs/promises"))
const fsSync = __importStar(require("fs"))
const node_cache_1 = __importDefault(require("node-cache"))
const zod_1 = require("zod")
const types_1 = require("@ali-code/types")
const safeWriteJson_1 = require("../../../utils/safeWriteJson")
const ContextProxy_1 = require("../../../core/config/ContextProxy")
const storage_1 = require("../../../utils/storage")
const fs_1 = require("../../../utils/fs")
const openrouter_1 = require("./openrouter")
const vercel_ai_gateway_1 = require("./vercel-ai-gateway")
const requesty_1 = require("./requesty")
const unbound_1 = require("./unbound")
const litellm_1 = require("./litellm")
const ollama_1 = require("./ollama")
const lmstudio_1 = require("./lmstudio")
const poe_1 = require("./poe")
const memoryCache = new node_cache_1.default({ stdTTL: 5 * 60, checkperiod: 5 * 60 })
// Zod schema for validating ModelRecord structure from disk cache
const modelRecordSchema = zod_1.z.record(zod_1.z.string(), types_1.modelInfoSchema)
// Track in-flight refresh requests to prevent concurrent API calls for the same provider
// This prevents race conditions where multiple calls might overwrite each other's results
const inFlightRefresh = new Map()
async function writeModels(router, data) {
	const filename = `${router}_models.json`
	const cacheDir = await (0, storage_1.getCacheDirectoryPath)(
		ContextProxy_1.ContextProxy.instance.globalStorageUri.fsPath,
	)
	await (0, safeWriteJson_1.safeWriteJson)(path.join(cacheDir, filename), data)
}
async function readModels(router) {
	const filename = `${router}_models.json`
	const cacheDir = await (0, storage_1.getCacheDirectoryPath)(
		ContextProxy_1.ContextProxy.instance.globalStorageUri.fsPath,
	)
	const filePath = path.join(cacheDir, filename)
	const exists = await (0, fs_1.fileExistsAtPath)(filePath)
	return exists ? JSON.parse(await promises_1.default.readFile(filePath, "utf8")) : undefined
}
/**
 * Fetch models from the provider API.
 * Extracted to avoid duplication between getModels() and refreshModels().
 *
 * @param options - Provider options for fetching models
 * @returns Fresh models from the provider API
 */
async function fetchModelsFromProvider(options) {
	const { provider } = options
	let models
	switch (provider) {
		case "openrouter":
			models = await (0, openrouter_1.getOpenRouterModels)()
			break
		case "requesty":
			// Requesty models endpoint requires an API key for per-user custom policies.
			models = await (0, requesty_1.getRequestyModels)(options.baseUrl, options.apiKey)
			break
		case "unbound":
			models = await (0, unbound_1.getUnboundModels)(options.apiKey)
			break
		case "litellm":
			// Type safety ensures apiKey and baseUrl are always provided for LiteLLM.
			models = await (0, litellm_1.getLiteLLMModels)(options.apiKey, options.baseUrl)
			break
		case "ollama":
			models = await (0, ollama_1.getOllamaModels)(options.baseUrl, options.apiKey)
			break
		case "lmstudio":
			models = await (0, lmstudio_1.getLMStudioModels)(options.baseUrl)
			break
		case "vercel-ai-gateway":
			models = await (0, vercel_ai_gateway_1.getVercelAiGatewayModels)()
			break
		case "poe":
			models = await (0, poe_1.getPoeModels)(options.apiKey, options.baseUrl)
			break
		default: {
			// Ensures router is exhaustively checked if RouterName is a strict union.
			const exhaustiveCheck = provider
			throw new Error(`Unknown provider: ${exhaustiveCheck}`)
		}
	}
	return models
}
/**
 * Get models from the cache or fetch them from the provider and cache them.
 * There are two caches:
 * 1. Memory cache - This is a simple in-memory cache that is used to store models for a short period of time.
 * 2. File cache - This is a file-based cache that is used to store models for a longer period of time.
 *
 * @param router - The router to fetch models from.
 * @param apiKey - Optional API key for the provider.
 * @param baseUrl - Optional base URL for the provider (currently used only for LiteLLM).
 * @returns The models from the cache or the fetched models.
 */
const getModels = async (options) => {
	const { provider } = options
	let models = getModelsFromCache(provider)
	if (models) {
		return models
	}
	try {
		models = await fetchModelsFromProvider(options)
		const modelCount = Object.keys(models).length
		// Only cache non-empty results to prevent persisting failed API responses.
		// Empty results could indicate API failure rather than "no models exist".
		if (modelCount > 0) {
			memoryCache.set(provider, models)
			await writeModels(provider, models).catch((err) =>
				console.error(`[MODEL_CACHE] Error writing ${provider} models to file cache:`, err),
			)
		}
		return models
	} catch (error) {
		// Log the error and re-throw it so the caller can handle it (e.g., show a UI message).
		console.error(`[getModels] Failed to fetch models in modelCache for ${provider}:`, error)
		throw error // Re-throw the original error to be handled by the caller.
	}
}
exports.getModels = getModels
/**
 * Force-refresh models from API, bypassing cache.
 * Uses atomic writes so cache remains available during refresh.
 * This function also prevents concurrent API calls for the same provider using
 * in-flight request tracking to avoid race conditions.
 *
 * @param options - Provider options for fetching models
 * @returns Fresh models from API, or existing cache if refresh yields worse data
 */
const refreshModels = async (options) => {
	const { provider } = options
	// Check if there's already an in-flight refresh for this provider
	// This prevents race conditions where multiple concurrent refreshes might
	// overwrite each other's results
	const existingRequest = inFlightRefresh.get(provider)
	if (existingRequest) {
		return existingRequest
	}
	// Create the refresh promise and track it
	const refreshPromise = (async () => {
		try {
			// Force fresh API fetch - skip getModelsFromCache() check
			const models = await fetchModelsFromProvider(options)
			const modelCount = Object.keys(models).length
			// Get existing cached data for comparison
			const existingCache = getModelsFromCache(provider)
			const existingCount = existingCache ? Object.keys(existingCache).length : 0
			if (modelCount === 0) {
				return existingCount > 0 ? existingCache : {}
			}
			// Update memory cache first
			memoryCache.set(provider, models)
			// Atomically write to disk (safeWriteJson handles atomic writes)
			await writeModels(provider, models).catch((err) =>
				console.error(`[refreshModels] Error writing ${provider} models to disk:`, err),
			)
			return models
		} catch (error) {
			// Log the error for debugging, then return existing cache if available (graceful degradation)
			console.error(`[refreshModels] Failed to refresh ${provider} models:`, error)
			return getModelsFromCache(provider) || {}
		} finally {
			// Always clean up the in-flight tracking
			inFlightRefresh.delete(provider)
		}
	})()
	// Track the in-flight request
	inFlightRefresh.set(provider, refreshPromise)
	return refreshPromise
}
exports.refreshModels = refreshModels
/**
 * Initialize background model cache refresh.
 * Refreshes public provider caches without blocking or requiring auth.
 * Should be called once during extension activation.
 */
async function initializeModelCacheRefresh() {
	// Wait for extension to fully activate before refreshing
	setTimeout(async () => {
		// Providers that work without API keys
		const publicProviders = [
			{ provider: "openrouter", options: { provider: "openrouter" } },
			{ provider: "vercel-ai-gateway", options: { provider: "vercel-ai-gateway" } },
		]
		// Refresh each provider in background (fire and forget)
		for (const { options } of publicProviders) {
			;(0, exports.refreshModels)(options).catch(() => {
				// Silent fail - old cache remains available
			})
			// Small delay between refreshes to avoid API rate limits
			await new Promise((resolve) => setTimeout(resolve, 500))
		}
	}, 2000)
}
/**
 * Flush models memory cache for a specific router.
 *
 * @param options - The options for fetching models, including provider, apiKey, and baseUrl
 * @param refresh - If true, immediately fetch fresh data from API
 */
const flushModels = async (options, refresh = false) => {
	const { provider } = options
	if (refresh) {
		// Don't delete memory cache - let refreshModels atomically replace it
		// This prevents a race condition where getModels() might be called
		// before refresh completes, avoiding a gap in cache availability
		// Await the refresh to ensure the cache is updated before returning
		await (0, exports.refreshModels)(options)
	} else {
		// Only delete memory cache when not refreshing
		memoryCache.del(provider)
	}
}
exports.flushModels = flushModels
/**
 * Get models from cache, checking memory first, then disk.
 * This ensures providers always have access to last known good data,
 * preventing fallback to hardcoded defaults on startup.
 *
 * @param provider - The provider to get models for.
 * @returns Models from memory cache, disk cache, or undefined if not cached.
 */
function getModelsFromCache(provider) {
	// Check memory cache first (fast)
	const memoryModels = memoryCache.get(provider)
	if (memoryModels) {
		return memoryModels
	}
	// Memory cache miss - try to load from disk synchronously
	// This is acceptable because it only happens on cold start or after cache expiry
	try {
		const filename = `${provider}_models.json`
		const cacheDir = getCacheDirectoryPathSync()
		if (!cacheDir) {
			return undefined
		}
		const filePath = path.join(cacheDir, filename)
		// Use synchronous fs to avoid async complexity in getModel() callers
		if (fsSync.existsSync(filePath)) {
			const data = fsSync.readFileSync(filePath, "utf8")
			const models = JSON.parse(data)
			// Validate the disk cache data structure using Zod schema
			// This ensures the data conforms to ModelRecord = Record<string, ModelInfo>
			const validation = modelRecordSchema.safeParse(models)
			if (!validation.success) {
				console.error(
					`[MODEL_CACHE] Invalid disk cache data structure for ${provider}:`,
					validation.error.format(),
				)
				return undefined
			}
			// Populate memory cache for future fast access
			memoryCache.set(provider, validation.data)
			return validation.data
		}
	} catch (error) {
		console.error(`[MODEL_CACHE] Error loading ${provider} models from disk:`, error)
	}
	return undefined
}
/**
 * Synchronous version of getCacheDirectoryPath for use in getModelsFromCache.
 * Returns the cache directory path without async operations.
 */
function getCacheDirectoryPathSync() {
	try {
		const globalStoragePath = ContextProxy_1.ContextProxy.instance?.globalStorageUri?.fsPath
		if (!globalStoragePath) {
			return undefined
		}
		const cachePath = path.join(globalStoragePath, "cache")
		return cachePath
	} catch (error) {
		console.error(`[MODEL_CACHE] Error getting cache directory path:`, error)
		return undefined
	}
}
