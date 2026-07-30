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
Object.defineProperty(exports, "__esModule", { value: true })
exports.CodeIndexServiceFactory = void 0
const vscode = __importStar(require("vscode"))
const i18n_1 = require("../../i18n")
const embeddingModels_1 = require("../../shared/embeddingModels")
const package_1 = require("../../shared/package")
const openai_1 = require("./embedders/openai")
const ollama_1 = require("./embedders/ollama")
const openai_compatible_1 = require("./embedders/openai-compatible")
const gemini_1 = require("./embedders/gemini")
const mistral_1 = require("./embedders/mistral")
const vercel_ai_gateway_1 = require("./embedders/vercel-ai-gateway")
const bedrock_1 = require("./embedders/bedrock")
const openrouter_1 = require("./embedders/openrouter")
const qdrant_client_1 = require("./vector-store/qdrant-client")
const processors_1 = require("./processors")
const constants_1 = require("./constants")
/**
 * Factory class responsible for creating and configuring code indexing service dependencies.
 */
class CodeIndexServiceFactory {
	configManager
	workspacePath
	cacheManager
	constructor(configManager, workspacePath, cacheManager) {
		this.configManager = configManager
		this.workspacePath = workspacePath
		this.cacheManager = cacheManager
	}
	/**
	 * Creates an embedder instance based on the current configuration.
	 */
	createEmbedder() {
		const config = this.configManager.getConfig()
		const provider = config.embedderProvider
		if (provider === "openai") {
			const apiKey = config.openAiOptions?.openAiNativeApiKey
			if (!apiKey) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.openAiConfigMissing"))
			}
			return new openai_1.OpenAiEmbedder({
				...config.openAiOptions,
				openAiEmbeddingModelId: config.modelId,
			})
		} else if (provider === "ollama") {
			if (!config.ollamaOptions?.ollamaBaseUrl) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.ollamaConfigMissing"))
			}
			return new ollama_1.CodeIndexOllamaEmbedder({
				...config.ollamaOptions,
				ollamaModelId: config.modelId,
			})
		} else if (provider === "openai-compatible") {
			if (!config.openAiCompatibleOptions?.baseUrl || !config.openAiCompatibleOptions?.apiKey) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.openAiCompatibleConfigMissing"))
			}
			return new openai_compatible_1.OpenAICompatibleEmbedder(
				config.openAiCompatibleOptions.baseUrl,
				config.openAiCompatibleOptions.apiKey,
				config.modelId,
			)
		} else if (provider === "gemini") {
			if (!config.geminiOptions?.apiKey) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.geminiConfigMissing"))
			}
			return new gemini_1.GeminiEmbedder(config.geminiOptions.apiKey, config.modelId)
		} else if (provider === "mistral") {
			if (!config.mistralOptions?.apiKey) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.mistralConfigMissing"))
			}
			return new mistral_1.MistralEmbedder(config.mistralOptions.apiKey, config.modelId)
		} else if (provider === "vercel-ai-gateway") {
			if (!config.vercelAiGatewayOptions?.apiKey) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.vercelAiGatewayConfigMissing"))
			}
			return new vercel_ai_gateway_1.VercelAiGatewayEmbedder(config.vercelAiGatewayOptions.apiKey, config.modelId)
		} else if (provider === "bedrock") {
			// Only region is required for Bedrock (profile is optional)
			if (!config.bedrockOptions?.region) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.bedrockConfigMissing"))
			}
			return new bedrock_1.BedrockEmbedder(
				config.bedrockOptions.region,
				config.bedrockOptions.profile,
				config.modelId,
			)
		} else if (provider === "openrouter") {
			if (!config.openRouterOptions?.apiKey) {
				throw new Error((0, i18n_1.t)("embeddings:serviceFactory.openRouterConfigMissing"))
			}
			return new openrouter_1.OpenRouterEmbedder(
				config.openRouterOptions.apiKey,
				config.modelId,
				undefined, // maxItemTokens
				config.openRouterOptions.specificProvider,
			)
		}
		throw new Error(
			(0, i18n_1.t)("embeddings:serviceFactory.invalidEmbedderType", {
				embedderProvider: config.embedderProvider,
			}),
		)
	}
	/**
	 * Validates an embedder instance to ensure it's properly configured.
	 * @param embedder The embedder instance to validate
	 * @returns Promise resolving to validation result
	 */
	async validateEmbedder(embedder) {
		try {
			return await embedder.validateConfiguration()
		} catch (error) {
			// If validation throws an exception, preserve the original error message
			return {
				valid: false,
				error: error instanceof Error ? error.message : "embeddings:validation.configurationError",
			}
		}
	}
	/**
	 * Creates a vector store instance using the current configuration.
	 */
	createVectorStore() {
		const config = this.configManager.getConfig()
		const provider = config.embedderProvider
		const defaultModel = (0, embeddingModels_1.getDefaultModelId)(provider)
		// Use the embedding model ID from config, not the chat model IDs
		const modelId = config.modelId ?? defaultModel
		let vectorSize
		// First try to get the model-specific dimension from profiles
		vectorSize = (0, embeddingModels_1.getModelDimension)(provider, modelId)
		// Only use manual dimension if model doesn't have a built-in dimension
		if (!vectorSize && config.modelDimension && config.modelDimension > 0) {
			vectorSize = config.modelDimension
		}
		if (vectorSize === undefined || vectorSize <= 0) {
			if (provider === "openai-compatible") {
				throw new Error(
					(0, i18n_1.t)("embeddings:serviceFactory.vectorDimensionNotDeterminedOpenAiCompatible", {
						modelId,
						provider,
					}),
				)
			} else {
				throw new Error(
					(0, i18n_1.t)("embeddings:serviceFactory.vectorDimensionNotDetermined", { modelId, provider }),
				)
			}
		}
		if (!config.qdrantUrl) {
			throw new Error((0, i18n_1.t)("embeddings:serviceFactory.qdrantUrlMissing"))
		}
		// Assuming constructor is updated: new QdrantVectorStore(workspacePath, url, vectorSize, apiKey?)
		return new qdrant_client_1.QdrantVectorStore(
			this.workspacePath,
			config.qdrantUrl,
			vectorSize,
			config.qdrantApiKey,
		)
	}
	/**
	 * Creates a directory scanner instance with its required dependencies.
	 */
	createDirectoryScanner(embedder, vectorStore, parser, ignoreInstance) {
		// Get the configurable batch size from VSCode settings
		let batchSize
		try {
			batchSize = vscode.workspace
				.getConfiguration(package_1.Package.name)
				.get("codeIndex.embeddingBatchSize", constants_1.BATCH_SEGMENT_THRESHOLD)
		} catch {
			// In test environment, vscode.workspace might not be available
			batchSize = constants_1.BATCH_SEGMENT_THRESHOLD
		}
		return new processors_1.DirectoryScanner(
			embedder,
			vectorStore,
			parser,
			this.cacheManager,
			ignoreInstance,
			batchSize,
		)
	}
	/**
	 * Creates a file watcher instance with its required dependencies.
	 */
	createFileWatcher(context, embedder, vectorStore, cacheManager, ignoreInstance, aliIgnoreController) {
		// Get the configurable batch size from VSCode settings
		let batchSize
		try {
			batchSize = vscode.workspace
				.getConfiguration(package_1.Package.name)
				.get("codeIndex.embeddingBatchSize", constants_1.BATCH_SEGMENT_THRESHOLD)
		} catch {
			// In test environment, vscode.workspace might not be available
			batchSize = constants_1.BATCH_SEGMENT_THRESHOLD
		}
		return new processors_1.FileWatcher(
			this.workspacePath,
			context,
			cacheManager,
			embedder,
			vectorStore,
			ignoreInstance,
			aliIgnoreController,
			batchSize,
		)
	}
	/**
	 * Creates all required service dependencies if the service is properly configured.
	 * @throws Error if the service is not properly configured
	 */
	createServices(context, cacheManager, ignoreInstance, aliIgnoreController) {
		if (!this.configManager.isFeatureConfigured) {
			throw new Error((0, i18n_1.t)("embeddings:serviceFactory.codeIndexingNotConfigured"))
		}
		const embedder = this.createEmbedder()
		const vectorStore = this.createVectorStore()
		const parser = processors_1.codeParser
		const scanner = this.createDirectoryScanner(embedder, vectorStore, parser, ignoreInstance)
		const fileWatcher = this.createFileWatcher(
			context,
			embedder,
			vectorStore,
			cacheManager,
			ignoreInstance,
			aliIgnoreController,
		)
		return {
			embedder,
			vectorStore,
			parser,
			scanner,
			fileWatcher,
		}
	}
}
exports.CodeIndexServiceFactory = CodeIndexServiceFactory
