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
exports.flushModelProviders = exports.getModelEndpoints = void 0
const path = __importStar(require("path"))
const promises_1 = __importDefault(require("fs/promises"))
const node_cache_1 = __importDefault(require("node-cache"))
const sanitize_filename_1 = __importDefault(require("sanitize-filename"))
const ContextProxy_1 = require("../../../core/config/ContextProxy")
const storage_1 = require("../../../utils/storage")
const fs_1 = require("../../../utils/fs")
const safeWriteJson_1 = require("../../../utils/safeWriteJson")
const openrouter_1 = require("./openrouter")
const modelCache_1 = require("./modelCache")
const memoryCache = new node_cache_1.default({ stdTTL: 5 * 60, checkperiod: 5 * 60 })
const getCacheKey = (router, modelId) => (0, sanitize_filename_1.default)(`${router}_${modelId}`)
async function writeModelEndpoints(key, data) {
	const filename = `${key}_endpoints.json`
	const cacheDir = await (0, storage_1.getCacheDirectoryPath)(
		ContextProxy_1.ContextProxy.instance.globalStorageUri.fsPath,
	)
	await (0, safeWriteJson_1.safeWriteJson)(path.join(cacheDir, filename), data)
}
async function readModelEndpoints(key) {
	const filename = `${key}_endpoints.json`
	const cacheDir = await (0, storage_1.getCacheDirectoryPath)(
		ContextProxy_1.ContextProxy.instance.globalStorageUri.fsPath,
	)
	const filePath = path.join(cacheDir, filename)
	const exists = await (0, fs_1.fileExistsAtPath)(filePath)
	return exists ? JSON.parse(await promises_1.default.readFile(filePath, "utf8")) : undefined
}
const getModelEndpoints = async ({ router, modelId, endpoint }) => {
	// OpenRouter is the only provider that supports model endpoints, but you
	// can see how we'd extend this to other providers in the future.
	if (router !== "openrouter" || !modelId || !endpoint) {
		return {}
	}
	const key = getCacheKey(router, modelId)
	let modelProviders = memoryCache.get(key)
	if (modelProviders) {
		// console.log(`[getModelProviders] NodeCache hit for ${key} -> ${Object.keys(modelProviders).length}`)
		return modelProviders
	}
	modelProviders = await (0, openrouter_1.getOpenRouterModelEndpoints)(modelId)
	// Copy model-level capabilities from the parent model to each endpoint
	// These are capabilities that don't vary by provider (tools, reasoning, etc.)
	if (Object.keys(modelProviders).length > 0) {
		const parentModels = await (0, modelCache_1.getModels)({ provider: "openrouter" })
		const parentModel = parentModels[modelId]
		if (parentModel) {
			// Copy model-level capabilities to all endpoints
			// Clone arrays to avoid shared mutable references
			for (const endpointKey of Object.keys(modelProviders)) {
				modelProviders[endpointKey].supportsReasoningEffort = parentModel.supportsReasoningEffort
				modelProviders[endpointKey].supportedParameters = parentModel.supportedParameters
					? [...parentModel.supportedParameters]
					: undefined
			}
		}
	}
	if (Object.keys(modelProviders).length > 0) {
		// console.log(`[getModelProviders] API fetch for ${key} -> ${Object.keys(modelProviders).length}`)
		memoryCache.set(key, modelProviders)
		try {
			await writeModelEndpoints(key, modelProviders)
			// console.log(`[getModelProviders] wrote ${key} endpoints to file cache`)
		} catch (error) {
			console.error(`[getModelProviders] error writing ${key} endpoints to file cache`, error)
		}
		return modelProviders
	}
	try {
		modelProviders = await readModelEndpoints(router)
		// console.log(`[getModelProviders] read ${key} endpoints from file cache`)
	} catch (error) {
		console.error(`[getModelProviders] error reading ${key} endpoints from file cache`, error)
	}
	return modelProviders ?? {}
}
exports.getModelEndpoints = getModelEndpoints
const flushModelProviders = async (router, modelId) => memoryCache.del(getCacheKey(router, modelId))
exports.flushModelProviders = flushModelProviders
