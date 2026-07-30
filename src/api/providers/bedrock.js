"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.AwsBedrockHandler = void 0
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime")
const credential_providers_1 = require("@aws-sdk/credential-providers")
const types_1 = require("@ali-code/types")
const base_provider_1 = require("./base-provider")
const logging_1 = require("../../utils/logging")
const package_1 = require("../../shared/package")
const multi_point_strategy_1 = require("../transform/cache-strategy/multi-point-strategy")
const bedrock_converse_format_1 = require("../transform/bedrock-converse-format")
const model_params_1 = require("../transform/model-params")
const api_1 = require("../../shared/api")
const json_schema_1 = require("../../utils/json-schema")
/************************************************************************************
 *
 *     PROVIDER
 *
 *************************************************************************************/
class AwsBedrockHandler extends base_provider_1.BaseProvider {
	options
	client
	arnInfo
	providerName = "Bedrock"
	constructor(options) {
		super()
		this.options = options
		let region = this.options.awsRegion
		// process the various user input options, be opinionated about the intent of the options
		// and determine the model to use during inference and for cost calculations
		// There are variations on ARN strings that can be entered making the conditional logic
		// more involved than the non-ARN branch of logic
		if (this.options.awsCustomArn) {
			this.arnInfo = this.parseArn(this.options.awsCustomArn, region)
			if (!this.arnInfo.isValid) {
				logging_1.logger.error("Invalid ARN format", {
					ctx: "bedrock",
					errorMessage: this.arnInfo.errorMessage,
				})
				// Throw a consistent error with a prefix that can be detected by callers
				const errorMessage =
					this.arnInfo.errorMessage ||
					"Invalid ARN format. ARN should follow the pattern: arn:aws:bedrock:region:account-id:resource-type/resource-name"
				throw new Error("INVALID_ARN_FORMAT:" + errorMessage)
			}
			if (this.arnInfo.region && this.arnInfo.region !== this.options.awsRegion) {
				// Log  if there's a region mismatch between the ARN and the region selected by the user
				// We will use the ARNs region, so execution can continue, but log an info statement.
				// Log a warning if there's a region mismatch between the ARN and the region selected by the user
				// We will use the ARNs region, so execution can continue, but log an info statement.
				logging_1.logger.info(this.arnInfo.errorMessage, {
					ctx: "bedrock",
					selectedRegion: this.options.awsRegion,
					arnRegion: this.arnInfo.region,
				})
				this.options.awsRegion = this.arnInfo.region
			}
			this.options.apiModelId = this.arnInfo.modelId
			if (this.arnInfo.awsUseCrossRegionInference) this.options.awsUseCrossRegionInference = true
		}
		if (!this.options.modelTemperature) {
			this.options.modelTemperature = types_1.BEDROCK_DEFAULT_TEMPERATURE
		}
		this.costModelConfig = this.getModel()
		const clientConfig = {
			userAgentAppId: `AliCode#${package_1.Package.version}`,
			region: this.options.awsRegion,
			// Add the endpoint configuration when specified and enabled
			...(this.options.awsBedrockEndpoint &&
				this.options.awsBedrockEndpointEnabled && { endpoint: this.options.awsBedrockEndpoint }),
		}
		if (this.options.awsUseApiKey && this.options.awsApiKey) {
			// Use API key/token-based authentication if enabled and API key is set
			clientConfig.token = { token: this.options.awsApiKey }
			clientConfig.authSchemePreference = ["httpBearerAuth"] // Otherwise there's no end of credential problems.
			clientConfig.requestHandler = {
				// This should be the default anyway, but without setting something
				// this provider fails to work with LiteLLM passthrough.
				requestTimeout: 0,
			}
		} else if (this.options.awsUseProfile && this.options.awsProfile) {
			// Use profile-based credentials if enabled and profile is set
			clientConfig.credentials = (0, credential_providers_1.fromIni)({
				profile: this.options.awsProfile,
				ignoreCache: true,
			})
		} else if (this.options.awsAccessKey && this.options.awsSecretKey) {
			// Use direct credentials if provided
			clientConfig.credentials = {
				accessKeyId: this.options.awsAccessKey,
				secretAccessKey: this.options.awsSecretKey,
				...(this.options.awsSessionToken ? { sessionToken: this.options.awsSessionToken } : {}),
			}
		}
		this.client = new client_bedrock_runtime_1.BedrockRuntimeClient(clientConfig)
	}
	// Helper to guess model info from custom modelId string if not in bedrockModels
	guessModelInfoFromId(modelId) {
		// Define a mapping for model ID patterns and their configurations
		const modelConfigMap = {
			"claude-4": {
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsImages: true,
				supportsPromptCache: true,
			},
			"claude-3-7": {
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsImages: true,
				supportsPromptCache: true,
			},
			"claude-3-5": {
				maxTokens: 8192,
				contextWindow: 200_000,
				supportsImages: true,
				supportsPromptCache: true,
			},
			"claude-4-opus": {
				maxTokens: 4096,
				contextWindow: 200_000,
				supportsImages: true,
				supportsPromptCache: true,
			},
			"claude-3-opus": {
				maxTokens: 4096,
				contextWindow: 200_000,
				supportsImages: true,
				supportsPromptCache: true,
			},
			"claude-3-haiku": {
				maxTokens: 4096,
				contextWindow: 200_000,
				supportsImages: true,
				supportsPromptCache: true,
			},
		}
		// Match the model ID to a configuration
		const id = modelId.toLowerCase()
		for (const [pattern, config] of Object.entries(modelConfigMap)) {
			if (id.includes(pattern)) {
				return config
			}
		}
		// Default fallback
		return {
			maxTokens: types_1.BEDROCK_MAX_TOKENS,
			contextWindow: types_1.BEDROCK_DEFAULT_CONTEXT,
			supportsImages: false,
			supportsPromptCache: false,
		}
	}
	async *createMessage(systemPrompt, messages, metadata) {
		const modelConfig = this.getModel()
		const usePromptCache = Boolean(
			(this.options.awsUsePromptCache ?? true) && this.supportsAwsPromptCache(modelConfig),
		)
		const conversationId =
			messages.length > 0
				? `conv_${messages[0].role}_${
						typeof messages[0].content === "string"
							? messages[0].content.substring(0, 20)
							: "complex_content"
					}`
				: "default_conversation"
		const formatted = this.convertToBedrockConverseMessages(
			messages,
			systemPrompt,
			usePromptCache,
			modelConfig.info,
			conversationId,
		)
		let additionalModelRequestFields
		let thinkingEnabled = false
		// Determine if thinking should be enabled
		// metadata?.thinking?.enabled: Explicitly enabled through API metadata (direct request)
		// shouldUseReasoningBudget(): Enabled through user settings (enableReasoningEffort = true)
		const isThinkingExplicitlyEnabled = metadata?.thinking?.enabled
		const isThinkingEnabledBySettings =
			(0, api_1.shouldUseReasoningBudget)({ model: modelConfig.info, settings: this.options }) &&
			modelConfig.reasoning &&
			modelConfig.reasoningBudget
		if ((isThinkingExplicitlyEnabled || isThinkingEnabledBySettings) && modelConfig.info.supportsReasoningBudget) {
			thinkingEnabled = true
			additionalModelRequestFields = {
				thinking: {
					type: "enabled",
					budget_tokens: metadata?.thinking?.maxThinkingTokens || modelConfig.reasoningBudget || 4096,
				},
			}
			logging_1.logger.info("Extended thinking enabled for Bedrock request", {
				ctx: "bedrock",
				modelId: modelConfig.id,
				thinking: additionalModelRequestFields.thinking,
			})
		}
		const inferenceConfig = {
			maxTokens: modelConfig.maxTokens || modelConfig.info.maxTokens,
			temperature: modelConfig.temperature ?? this.options.modelTemperature,
		}
		// Check if 1M context is enabled for supported Claude 4 models
		// Use parseBaseModelId to handle cross-region inference prefixes
		const baseModelId = this.parseBaseModelId(modelConfig.id)
		const is1MContextEnabled =
			types_1.BEDROCK_1M_CONTEXT_MODEL_IDS.includes(baseModelId) && this.options.awsBedrock1MContext
		// Determine if service tier should be applied (checked later when building payload)
		const useServiceTier =
			this.options.awsBedrockServiceTier && types_1.BEDROCK_SERVICE_TIER_MODEL_IDS.includes(baseModelId)
		if (useServiceTier) {
			logging_1.logger.info("Service tier specified for Bedrock request", {
				ctx: "bedrock",
				modelId: modelConfig.id,
				serviceTier: this.options.awsBedrockServiceTier,
			})
		}
		// Add anthropic_beta headers for various features
		// Start with an empty array and add betas as needed
		const anthropicBetas = []
		// Add 1M context beta if enabled
		if (is1MContextEnabled) {
			anthropicBetas.push("context-1m-2025-08-07")
		}
		// Add fine-grained tool streaming beta for Claude models
		// This enables proper tool use streaming for Anthropic models on Bedrock
		if (baseModelId.includes("claude")) {
			anthropicBetas.push("fine-grained-tool-streaming-2025-05-14")
		}
		// Apply anthropic_beta to additionalModelRequestFields if any betas are needed
		if (anthropicBetas.length > 0) {
			if (!additionalModelRequestFields) {
				additionalModelRequestFields = {}
			}
			additionalModelRequestFields.anthropic_beta = anthropicBetas
		}
		const toolConfig = {
			tools: this.convertToolsForBedrock(metadata?.tools ?? []),
			toolChoice: this.convertToolChoiceForBedrock(metadata?.tool_choice),
		}
		// Build payload with optional service_tier at top level
		// Service tier is a top-level parameter per AWS documentation, NOT inside additionalModelRequestFields
		// https://docs.aws.amazon.com/bedrock/latest/userguide/service-tiers-inference.html
		const payload = {
			modelId: modelConfig.id,
			messages: formatted.messages,
			system: formatted.system,
			inferenceConfig,
			...(additionalModelRequestFields && { additionalModelRequestFields }),
			// Add anthropic_version at top level when using thinking features
			...(thinkingEnabled && { anthropic_version: "bedrock-2023-05-31" }),
			toolConfig,
			// Add service_tier as a top-level parameter (not inside additionalModelRequestFields)
			...(useServiceTier && { service_tier: this.options.awsBedrockServiceTier }),
		}
		// Create AbortController with 10 minute timeout
		const controller = new AbortController()
		let timeoutId
		try {
			timeoutId = setTimeout(
				() => {
					controller.abort()
				},
				10 * 60 * 1000,
			)
			const command = new client_bedrock_runtime_1.ConverseStreamCommand(payload)
			const response = await this.client.send(command, {
				abortSignal: controller.signal,
			})
			if (!response.stream) {
				clearTimeout(timeoutId)
				throw new Error("No stream available in the response")
			}
			for await (const chunk of response.stream) {
				// Parse the chunk as JSON if it's a string (for tests)
				let streamEvent
				try {
					streamEvent = typeof chunk === "string" ? JSON.parse(chunk) : chunk
				} catch (e) {
					logging_1.logger.error("Failed to parse stream event", {
						ctx: "bedrock",
						error: e instanceof Error ? e : String(e),
						chunk: typeof chunk === "string" ? chunk : "binary data",
					})
					continue
				}
				// Handle metadata events first
				if (streamEvent.metadata?.usage) {
					const usage = streamEvent.metadata?.usage || {}
					// Check both field naming conventions for cache tokens
					const cacheReadTokens = usage.cacheReadInputTokens || usage.cacheReadInputTokenCount || 0
					const cacheWriteTokens = usage.cacheWriteInputTokens || usage.cacheWriteInputTokenCount || 0
					// Always include all available token information
					yield {
						type: "usage",
						inputTokens: usage.inputTokens || 0,
						outputTokens: usage.outputTokens || 0,
						cacheReadTokens: cacheReadTokens,
						cacheWriteTokens: cacheWriteTokens,
					}
					continue
				}
				if (streamEvent?.trace?.promptRouter?.invokedModelId) {
					try {
						//update the in-use model info to be based on the invoked Model Id for the router
						//so that pricing, context window, caching etc have values that can be used
						//However, we want to keep the id of the model to be the ID for the router for
						//subsequent requests so they are sent back through the router
						let invokedArnInfo = this.parseArn(streamEvent.trace.promptRouter.invokedModelId)
						let invokedModel = this.getModelById(invokedArnInfo.modelId, invokedArnInfo.modelType)
						if (invokedModel) {
							invokedModel.id = modelConfig.id
							this.costModelConfig = invokedModel
						}
						// Handle metadata events for the promptRouter.
						if (streamEvent?.trace?.promptRouter?.usage) {
							const routerUsage = streamEvent.trace.promptRouter.usage
							// Check both field naming conventions for cache tokens
							const cacheReadTokens =
								routerUsage.cacheReadTokens || routerUsage.cacheReadInputTokenCount || 0
							const cacheWriteTokens =
								routerUsage.cacheWriteTokens || routerUsage.cacheWriteInputTokenCount || 0
							yield {
								type: "usage",
								inputTokens: routerUsage.inputTokens || 0,
								outputTokens: routerUsage.outputTokens || 0,
								cacheReadTokens: cacheReadTokens,
								cacheWriteTokens: cacheWriteTokens,
							}
						}
					} catch (error) {
						logging_1.logger.error("Error handling Bedrock invokedModelId", {
							ctx: "bedrock",
							error: error instanceof Error ? error : String(error),
						})
					} finally {
						// eslint-disable-next-line no-unsafe-finally
						continue
					}
				}
				// Handle message start
				if (streamEvent.messageStart) {
					continue
				}
				// Handle content blocks
				if (streamEvent.contentBlockStart) {
					const cbStart = streamEvent.contentBlockStart
					// Check if this is a reasoning block (AWS SDK structure)
					if (cbStart.contentBlock?.reasoningContent) {
						if (cbStart.contentBlockIndex && cbStart.contentBlockIndex > 0) {
							yield { type: "reasoning", text: "\n" }
						}
						yield {
							type: "reasoning",
							text: cbStart.contentBlock.reasoningContent.text || "",
						}
					}
					// Check for thinking block - handle both possible AWS SDK structures
					// cbStart.contentBlock: newer structure
					// cbStart.content_block: alternative structure seen in some AWS SDK versions
					else if (cbStart.contentBlock?.type === "thinking" || cbStart.content_block?.type === "thinking") {
						const contentBlock = cbStart.contentBlock || cbStart.content_block
						if (cbStart.contentBlockIndex && cbStart.contentBlockIndex > 0) {
							yield { type: "reasoning", text: "\n" }
						}
						if (contentBlock?.thinking) {
							yield {
								type: "reasoning",
								text: contentBlock.thinking,
							}
						}
					}
					// Handle tool use block start
					else if (cbStart.start?.toolUse || cbStart.contentBlock?.toolUse) {
						const toolUse = cbStart.start?.toolUse || cbStart.contentBlock?.toolUse
						if (toolUse) {
							yield {
								type: "tool_call_partial",
								index: cbStart.contentBlockIndex ?? 0,
								id: toolUse.toolUseId,
								name: toolUse.name,
								arguments: undefined,
							}
						}
					} else if (cbStart.start?.text) {
						yield {
							type: "text",
							text: cbStart.start.text,
						}
					}
					continue
				}
				// Handle content deltas
				if (streamEvent.contentBlockDelta) {
					const cbDelta = streamEvent.contentBlockDelta
					const delta = cbDelta.delta
					// Process reasoning and text content deltas
					// Multiple structures are supported for AWS SDK compatibility:
					// - delta.reasoningContent.text: AWS docs structure for reasoning
					// - delta.thinking: alternative structure for thinking content
					// - delta.text: standard text content
					// - delta.toolUse.input: tool input arguments
					if (delta) {
						// Check for reasoningContent property (AWS SDK structure)
						if (delta.reasoningContent?.text) {
							yield {
								type: "reasoning",
								text: delta.reasoningContent.text,
							}
							continue
						}
						// Handle tool use input delta
						if (delta.toolUse?.input) {
							yield {
								type: "tool_call_partial",
								index: cbDelta.contentBlockIndex ?? 0,
								id: undefined,
								name: undefined,
								arguments: delta.toolUse.input,
							}
							continue
						}
						// Handle alternative thinking structure (fallback for older SDK versions)
						if (delta.type === "thinking_delta" && delta.thinking) {
							yield {
								type: "reasoning",
								text: delta.thinking,
							}
						} else if (delta.text) {
							yield {
								type: "text",
								text: delta.text,
							}
						}
					}
					continue
				}
				// Handle message stop
				if (streamEvent.messageStop) {
					continue
				}
			}
			// Clear timeout after stream completes
			clearTimeout(timeoutId)
		} catch (error) {
			// Clear timeout on error
			clearTimeout(timeoutId)
			// Capture error message before processing
			const errorMessage = error instanceof Error ? error.message : String(error)
			// Check if this is a throttling error that should trigger retry logic
			const errorType = this.getErrorType(error)
			// For throttling errors, throw immediately without yielding chunks
			// This allows the retry mechanism in attemptApiRequest() to catch and handle it
			// The retry logic in Task.ts (around line 1817) expects errors to be thrown
			// on the first chunk for proper exponential backoff behavior
			if (errorType === "THROTTLING") {
				if (error instanceof Error) {
					throw error
				} else {
					throw new Error("Throttling error occurred")
				}
			}
			// For non-throttling errors, use the standard error handling with chunks
			const errorChunks = this.handleBedrockError(error, true) // true for streaming context
			// Yield each chunk individually to ensure type compatibility
			for (const chunk of errorChunks) {
				yield chunk // Cast to any to bypass type checking since we know the structure is correct
			}
			// Re-throw with enhanced error message for retry system
			const enhancedErrorMessage = this.formatErrorMessage(error, this.getErrorType(error), true)
			if (error instanceof Error) {
				const enhancedError = new Error(enhancedErrorMessage)
				// Preserve important properties from the original error
				enhancedError.name = error.name
				// Validate and preserve status property
				if ("status" in error && typeof error.status === "number") {
					enhancedError.status = error.status
				}
				// Validate and preserve $metadata property
				if ("$metadata" in error && typeof error.$metadata === "object" && error.$metadata !== null) {
					enhancedError.$metadata = error.$metadata
				}
				throw enhancedError
			} else {
				throw new Error("An unknown error occurred")
			}
		}
	}
	async completePrompt(prompt) {
		try {
			const modelConfig = this.getModel()
			// For completePrompt, thinking is typically not used, but we should still check
			// if thinking was somehow enabled in the model config
			const thinkingEnabled =
				(0, api_1.shouldUseReasoningBudget)({ model: modelConfig.info, settings: this.options }) &&
				modelConfig.reasoning &&
				modelConfig.reasoningBudget
			const inferenceConfig = {
				maxTokens: modelConfig.maxTokens || modelConfig.info.maxTokens,
				temperature: modelConfig.temperature ?? this.options.modelTemperature,
			}
			// For completePrompt, use a unique conversation ID based on the prompt
			const conversationId = `prompt_${prompt.substring(0, 20)}`
			const payload = {
				modelId: modelConfig.id,
				messages: this.convertToBedrockConverseMessages(
					[
						{
							role: "user",
							content: prompt,
						},
					],
					undefined,
					false,
					modelConfig.info,
					conversationId,
				).messages,
				inferenceConfig,
			}
			const command = new client_bedrock_runtime_1.ConverseCommand(payload)
			const response = await this.client.send(command)
			if (
				response?.output?.message?.content &&
				response.output.message.content.length > 0 &&
				response.output.message.content[0].text &&
				response.output.message.content[0].text.trim().length > 0
			) {
				try {
					return response.output.message.content[0].text
				} catch (parseError) {
					logging_1.logger.error("Failed to parse Bedrock response", {
						ctx: "bedrock",
						error: parseError instanceof Error ? parseError : String(parseError),
					})
				}
			}
			return ""
		} catch (error) {
			// Capture error message
			const model = this.getModel()
			const providerErrorMessage = error instanceof Error ? error.message : String(error)
			// Use the extracted error handling method for all errors
			const errorResult = this.handleBedrockError(error, false) // false for non-streaming context
			// Since we're in a non-streaming context, we know the result is a string
			const errorMessage = errorResult
			// Create enhanced error for retry system
			const enhancedError = new Error(errorMessage)
			if (error instanceof Error) {
				// Preserve important properties from the original error
				enhancedError.name = error.name
				// Validate and preserve status property
				if ("status" in error && typeof error.status === "number") {
					enhancedError.status = error.status
				}
				// Validate and preserve $metadata property
				if ("$metadata" in error && typeof error.$metadata === "object" && error.$metadata !== null) {
					enhancedError.$metadata = error.$metadata
				}
			}
			throw enhancedError
		}
	}
	/**
	 * Convert Anthropic messages to Bedrock Converse format
	 */
	convertToBedrockConverseMessages(
		anthropicMessages,
		systemMessage,
		usePromptCache = false,
		modelInfo,
		conversationId,
	) {
		// First convert messages using shared converter for proper image handling
		const convertedMessages = (0, bedrock_converse_format_1.convertToBedrockConverseMessages)(anthropicMessages)
		// If prompt caching is disabled, return the converted messages directly
		if (!usePromptCache) {
			return {
				system: systemMessage ? [{ text: systemMessage }] : [],
				messages: convertedMessages,
			}
		}
		// Convert model info to expected format for cache strategy
		const cacheModelInfo = {
			maxTokens: modelInfo?.maxTokens || 8192,
			contextWindow: modelInfo?.contextWindow || 200_000,
			supportsPromptCache: modelInfo?.supportsPromptCache || false,
			maxCachePoints: modelInfo?.maxCachePoints || 0,
			minTokensPerCachePoint: modelInfo?.minTokensPerCachePoint || 50,
			cachableFields: modelInfo?.cachableFields || [],
		}
		// Get previous cache point placements for this conversation if available
		const previousPlacements =
			conversationId && this.previousCachePointPlacements[conversationId]
				? this.previousCachePointPlacements[conversationId]
				: undefined
		// Create config for cache strategy
		const config = {
			modelInfo: cacheModelInfo,
			systemPrompt: systemMessage,
			messages: anthropicMessages,
			usePromptCache,
			previousCachePointPlacements: previousPlacements,
		}
		// Get cache point placements
		let strategy = new multi_point_strategy_1.MultiPointStrategy(config)
		const cacheResult = strategy.determineOptimalCachePoints()
		// Store cache point placements for future use if conversation ID is provided
		if (conversationId && cacheResult.messageCachePointPlacements) {
			this.previousCachePointPlacements[conversationId] = cacheResult.messageCachePointPlacements
		}
		// Apply cache points to the properly converted messages
		const messagesWithCache = convertedMessages.map((msg, index) => {
			const placement = cacheResult.messageCachePointPlacements?.find((p) => p.index === index)
			if (placement) {
				return {
					...msg,
					content: [...(msg.content || []), { cachePoint: { type: "default" } }],
				}
			}
			return msg
		})
		return {
			system: cacheResult.system,
			messages: messagesWithCache,
		}
	}
	/************************************************************************************
	 *
	 *     MODEL IDENTIFICATION
	 *
	 *************************************************************************************/
	costModelConfig = {
		id: "",
		info: { maxTokens: 0, contextWindow: 0, supportsPromptCache: false, supportsImages: false },
	}
	parseArn(arn, region) {
		/*
		 * VIA Ali analysis: platform-independent Regex. It's designed to parse Amazon Bedrock ARNs and doesn't rely on any platform-specific features
		 * like file path separators, line endings, or case sensitivity behaviors. The forward slashes in the regex are properly escaped and
		 * represent literal characters in the AWS ARN format, not filesystem paths. This regex will function consistently across Windows,
		 * macOS, Linux, and any other operating system where JavaScript runs.
		 *
		 * Supports any AWS partition (aws, aws-us-gov, aws-cn, or future partitions).
		 * The partition is not captured since we don't need to use it.
		 *
		 *  This matches ARNs like:
		 *  - Foundation Model: arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-v2
		 *  - GovCloud Inference Profile: arn:aws-us-gov:bedrock:us-gov-west-1:123456789012:inference-profile/us-gov.anthropic.claude-sonnet-4-5-20250929-v1:0
		 *  - Prompt Router: arn:aws:bedrock:us-west-2:123456789012:prompt-router/anthropic-claude
		 *  - Inference Profile: arn:aws:bedrock:us-west-2:123456789012:inference-profile/anthropic.claude-v2
		 *  - Cross Region Inference Profile: arn:aws:bedrock:us-west-2:123456789012:inference-profile/us.anthropic.claude-3-5-sonnet-20241022-v2:0
		 *  - Custom Model (Provisioned Throughput): arn:aws:bedrock:us-west-2:123456789012:provisioned-model/my-custom-model
		 *  - Imported Model: arn:aws:bedrock:us-west-2:123456789012:imported-model/my-imported-model
		 *
		 * match[0] - The entire matched string
		 * match[1] - The region (e.g., "us-east-1", "us-gov-west-1")
		 * match[2] - The account ID (can be empty string for AWS-managed resources)
		 * match[3] - The resource type (e.g., "foundation-model")
		 * match[4] - The resource ID (e.g., "anthropic.claude-3-sonnet-20240229-v1:0")
		 */
		const arnRegex = /^arn:[^:]+:(?:bedrock|sagemaker):([^:]+):([^:]*):(?:([^\/]+)\/([\w\.\-:]+)|([^\/]+))$/
		let match = arn.match(arnRegex)
		if (match && match[1] && match[3] && match[4]) {
			// Create the result object
			const result = {
				isValid: true,
				crossRegionInference: false, // Default to false
			}
			result.modelType = match[3]
			const originalModelId = match[4]
			result.modelId = this.parseBaseModelId(originalModelId)
			// Extract the region from the first capture group
			const arnRegion = match[1]
			result.region = arnRegion
			// Check if the original model ID had a region prefix
			if (originalModelId && result.modelId !== originalModelId) {
				// If the model ID changed after parsing, it had a region prefix
				let prefix = originalModelId.replace(result.modelId, "")
				result.crossRegionInference = AwsBedrockHandler.isSystemInferenceProfile(prefix)
			}
			// Check if region in ARN matches provided region (if specified)
			if (region && arnRegion !== region) {
				result.errorMessage = `Region mismatch: The region in your ARN (${arnRegion}) does not match your selected region (${region}). This may cause access issues. The provider will use the region from the ARN.`
				result.region = arnRegion
			}
			return result
		}
		// If we get here, the regex didn't match
		return {
			isValid: false,
			region: undefined,
			modelType: undefined,
			modelId: undefined,
			errorMessage: "Invalid ARN format. ARN should follow the Amazon Bedrock ARN pattern.",
			crossRegionInference: false,
		}
	}
	//This strips any region prefix that used on cross-region model inference ARNs
	parseBaseModelId(modelId) {
		if (!modelId) {
			return modelId
		}
		// Remove AWS cross-region inference profile prefixes
		// as defined in AWS_INFERENCE_PROFILE_MAPPING
		for (const [_, inferenceProfile] of types_1.AWS_INFERENCE_PROFILE_MAPPING) {
			if (modelId.startsWith(inferenceProfile)) {
				// Remove the inference profile prefix from the model ID
				return modelId.substring(inferenceProfile.length)
			}
		}
		// Also strip Global Inference profile prefix if present
		if (modelId.startsWith("global.")) {
			return modelId.substring("global.".length)
		}
		// Return the model ID as-is for all other cases
		return modelId
	}
	//Prompt Router responses come back in a different sequence and the model used is in the response and must be fetched by name
	getModelById(modelId, modelType) {
		// Try to find the model in bedrockModels
		const baseModelId = this.parseBaseModelId(modelId)
		let model
		if (baseModelId in types_1.bedrockModels) {
			//Do a deep copy of the model info so that later in the code the model id and maxTokens can be set.
			// The bedrockModels array is a constant and updating the model ID from the returned invokedModelID value
			// in a prompt router response isn't possible on the constant.
			model = { id: baseModelId, info: JSON.parse(JSON.stringify(types_1.bedrockModels[baseModelId])) }
		} else if (modelType && modelType.includes("router")) {
			model = {
				id: types_1.bedrockDefaultPromptRouterModelId,
				info: JSON.parse(JSON.stringify(types_1.bedrockModels[types_1.bedrockDefaultPromptRouterModelId])),
			}
		} else {
			// Use heuristics for model info, then allow overrides from ProviderSettings
			const guessed = this.guessModelInfoFromId(modelId)
			model = {
				id: types_1.bedrockDefaultModelId,
				info: {
					...JSON.parse(JSON.stringify(types_1.bedrockModels[types_1.bedrockDefaultModelId])),
					...guessed,
				},
			}
		}
		// Always allow user to override detected/guessed maxTokens and contextWindow
		if (this.options.modelMaxTokens && this.options.modelMaxTokens > 0) {
			model.info.maxTokens = this.options.modelMaxTokens
		}
		if (this.options.awsModelContextWindow && this.options.awsModelContextWindow > 0) {
			model.info.contextWindow = this.options.awsModelContextWindow
		}
		return model
	}
	getModel() {
		if (this.costModelConfig?.id?.trim().length > 0) {
			// Get model params for cost model config
			const params = (0, model_params_1.getModelParams)({
				format: "anthropic",
				modelId: this.costModelConfig.id,
				model: this.costModelConfig.info,
				settings: this.options,
				defaultTemperature: types_1.BEDROCK_DEFAULT_TEMPERATURE,
			})
			return { ...this.costModelConfig, ...params }
		}
		let modelConfig = undefined
		// If custom ARN is provided, use it
		if (this.options.awsCustomArn) {
			modelConfig = this.getModelById(this.arnInfo.modelId, this.arnInfo.modelType)
			//If the user entered an ARN for a foundation-model they've done the same thing as picking from our list of options.
			//We leave the model data matching the same as if a drop-down input method was used by not overwriting the model ID with the user input ARN
			//Otherwise the ARN is not a foundation-model resource type that ARN should be used as the identifier in Bedrock interactions
			if (this.arnInfo.modelType !== "foundation-model") modelConfig.id = this.options.awsCustomArn
		} else {
			//a model was selected from the drop down
			modelConfig = this.getModelById(this.options.apiModelId)
			// Apply Global Inference prefix if enabled and supported (takes precedence over cross-region)
			const baseIdForGlobal = this.parseBaseModelId(modelConfig.id)
			if (
				this.options.awsUseGlobalInference &&
				types_1.BEDROCK_GLOBAL_INFERENCE_MODEL_IDS.includes(baseIdForGlobal)
			) {
				modelConfig.id = `global.${baseIdForGlobal}`
			}
			// Otherwise, add cross-region inference prefix if enabled
			else if (this.options.awsUseCrossRegionInference && this.options.awsRegion) {
				const prefix = AwsBedrockHandler.getPrefixForRegion(this.options.awsRegion)
				if (prefix) {
					modelConfig.id = `${prefix}${modelConfig.id}`
				}
			}
		}
		// Check if 1M context is enabled for supported Claude 4 models
		// Use parseBaseModelId to handle cross-region inference prefixes
		const baseModelId = this.parseBaseModelId(modelConfig.id)
		if (types_1.BEDROCK_1M_CONTEXT_MODEL_IDS.includes(baseModelId) && this.options.awsBedrock1MContext) {
			// Update context window and pricing to 1M tier when 1M context beta is enabled
			const tier = modelConfig.info.tiers?.[0]
			modelConfig.info = {
				...modelConfig.info,
				contextWindow: tier?.contextWindow ?? 1_000_000,
				inputPrice: tier?.inputPrice ?? modelConfig.info.inputPrice,
				outputPrice: tier?.outputPrice ?? modelConfig.info.outputPrice,
				cacheWritesPrice: tier?.cacheWritesPrice ?? modelConfig.info.cacheWritesPrice,
				cacheReadsPrice: tier?.cacheReadsPrice ?? modelConfig.info.cacheReadsPrice,
			}
		}
		// Get model params including reasoning configuration
		const params = (0, model_params_1.getModelParams)({
			format: "anthropic",
			modelId: modelConfig.id,
			model: modelConfig.info,
			settings: this.options,
			defaultTemperature: types_1.BEDROCK_DEFAULT_TEMPERATURE,
		})
		// Apply service tier pricing if specified and model supports it
		const baseModelIdForTier = this.parseBaseModelId(modelConfig.id)
		if (this.options.awsBedrockServiceTier && types_1.BEDROCK_SERVICE_TIER_MODEL_IDS.includes(baseModelIdForTier)) {
			const pricingMultiplier = types_1.BEDROCK_SERVICE_TIER_PRICING[this.options.awsBedrockServiceTier]
			if (pricingMultiplier && pricingMultiplier !== 1.0) {
				// Apply pricing multiplier to all price fields
				modelConfig.info = {
					...modelConfig.info,
					inputPrice: modelConfig.info.inputPrice
						? modelConfig.info.inputPrice * pricingMultiplier
						: undefined,
					outputPrice: modelConfig.info.outputPrice
						? modelConfig.info.outputPrice * pricingMultiplier
						: undefined,
					cacheWritesPrice: modelConfig.info.cacheWritesPrice
						? modelConfig.info.cacheWritesPrice * pricingMultiplier
						: undefined,
					cacheReadsPrice: modelConfig.info.cacheReadsPrice
						? modelConfig.info.cacheReadsPrice * pricingMultiplier
						: undefined,
				}
			}
		}
		// Don't override maxTokens/contextWindow here; handled in getModelById (and includes user overrides)
		return { ...modelConfig, ...params }
	}
	/************************************************************************************
	 *
	 *     CACHE
	 *
	 *************************************************************************************/
	// Store previous cache point placements for maintaining consistency across consecutive messages
	previousCachePointPlacements = {}
	supportsAwsPromptCache(modelConfig) {
		// Check if the model supports prompt cache
		// The cachableFields property is not part of the ModelInfo type in schemas
		// but it's used in the bedrockModels object in shared/api.ts
		return (
			modelConfig?.info?.supportsPromptCache &&
			// Use optional chaining and type assertion to access cachableFields
			modelConfig?.info?.cachableFields &&
			modelConfig?.info?.cachableFields?.length > 0
		)
	}
	/**
	 * Removes any existing cachePoint nodes from content blocks
	 */
	removeCachePoints(content) {
		if (Array.isArray(content)) {
			return content.map((block) => {
				// Use destructuring to remove cachePoint property
				const { cachePoint: _, ...rest } = block
				return rest
			})
		}
		return content
	}
	/************************************************************************************
	 *
	 *     NATIVE TOOLS
	 *
	 *************************************************************************************/
	/**
	 * Convert OpenAI tool definitions to Bedrock Converse format
	 * Transforms JSON Schema to draft 2020-12 compliant format required by Claude models.
	 * @param tools Array of OpenAI ChatCompletionTool definitions
	 * @returns Array of Bedrock Tool definitions
	 */
	convertToolsForBedrock(tools) {
		return tools
			.filter((tool) => tool.type === "function")
			.map((tool) => ({
				toolSpec: {
					name: tool.function.name,
					description: tool.function.description,
					inputSchema: {
						// Normalize schema to JSON Schema draft 2020-12 compliant format
						// This converts type: ["T", "null"] to anyOf: [{type: "T"}, {type: "null"}]
						json: (0, json_schema_1.normalizeToolSchema)(tool.function.parameters),
					},
				},
			}))
	}
	/**
	 * Convert OpenAI tool_choice to Bedrock ToolChoice format
	 * @param toolChoice OpenAI tool_choice parameter
	 * @returns Bedrock ToolChoice configuration
	 */
	convertToolChoiceForBedrock(toolChoice) {
		if (!toolChoice) {
			// Default to auto - model decides whether to use tools
			return { auto: {} }
		}
		if (typeof toolChoice === "string") {
			switch (toolChoice) {
				case "none":
					return undefined // Bedrock doesn't have "none", just omit tools
				case "auto":
					return { auto: {} }
				case "required":
					return { any: {} } // Model must use at least one tool
				default:
					return { auto: {} }
			}
		}
		// Handle object form { type: "function", function: { name: string } }
		if (typeof toolChoice === "object" && "function" in toolChoice) {
			return {
				tool: {
					name: toolChoice.function.name,
				},
			}
		}
		return { auto: {} }
	}
	/************************************************************************************
	 *
	 *     AMAZON REGIONS
	 *
	 *************************************************************************************/
	static getPrefixForRegion(region) {
		// Use AWS recommended inference profile prefixes
		// Array is pre-sorted by pattern length (descending) to ensure more specific patterns match first
		for (const [regionPattern, inferenceProfile] of types_1.AWS_INFERENCE_PROFILE_MAPPING) {
			if (region.startsWith(regionPattern)) {
				return inferenceProfile
			}
		}
		return undefined
	}
	static isSystemInferenceProfile(prefix) {
		// Check if the prefix is defined in AWS_INFERENCE_PROFILE_MAPPING
		for (const [_, inferenceProfile] of types_1.AWS_INFERENCE_PROFILE_MAPPING) {
			if (prefix === inferenceProfile) {
				return true
			}
		}
		return false
	}
	/************************************************************************************
	 *
	 *     ERROR HANDLING
	 *
	 *************************************************************************************/
	/**
	 * Error type definitions for Bedrock API errors
	 */
	static ERROR_TYPES = {
		ACCESS_DENIED: {
			patterns: ["access", "denied", "permission"],
			messageTemplate: `You don't have access to the model specified.

Please verify:
1. Try cross-region inference if you're using a foundation model
2. If using an ARN, verify the ARN is correct and points to a valid model
3. Your AWS credentials have permission to access this model (check IAM policies)
4. The region in the ARN matches the region where the model is deployed
5. If using a provisioned model, ensure it's active and not in a failed state`,
			logLevel: "error",
		},
		NOT_FOUND: {
			patterns: ["not found", "does not exist"],
			messageTemplate: `The specified ARN does not exist or is invalid. Please check:

1. The ARN format is correct (arn:aws:bedrock:region:account-id:resource-type/resource-name)
2. The model exists in the specified region
3. The account ID in the ARN is correct`,
			logLevel: "error",
		},
		THROTTLING: {
			patterns: [
				"throttl",
				"rate",
				"limit",
				"bedrock is unable to process your request", // Amazon Bedrock specific throttling message
				"please wait",
				"quota exceeded",
				"service unavailable",
				"busy",
				"overloaded",
				"too many requests",
				"request limit",
				"concurrent requests",
			],
			messageTemplate: `Request was throttled or rate limited. Please try:
1. Reducing the frequency of requests
2. If using a provisioned model, check its throughput settings
3. Contact AWS support to request a quota increase if needed

`,
			logLevel: "error",
		},
		TOO_MANY_TOKENS: {
			patterns: ["too many tokens", "token limit exceeded", "context length", "maximum context length"],
			messageTemplate: `"Too many tokens" error detected.
Possible Causes:
1. Input exceeds model's context window limit
2. Rate limiting (too many tokens per minute)
3. Quota exceeded for token usage
4. Other token-related service limitations

Suggestions:
1. Reduce the size of your input
2. Split your request into smaller chunks
3. Use a model with a larger context window
4. If rate limited, reduce request frequency
5. Check your Amazon Bedrock quotas and limits

`,
			logLevel: "error",
		},
		SERVICE_QUOTA_EXCEEDED: {
			patterns: ["service quota exceeded", "service quota", "quota exceeded for model"],
			messageTemplate: `Service quota exceeded. This error indicates you've reached AWS service limits.

Please try:
1. Contact AWS support to request a quota increase
2. Reduce request frequency temporarily
3. Check your Amazon Bedrock quotas in the AWS console
4. Consider using a different model or region with available capacity

`,
			logLevel: "error",
		},
		MODEL_NOT_READY: {
			patterns: ["model not ready", "model is not ready", "provisioned throughput not ready", "model loading"],
			messageTemplate: `Model is not ready or still loading. This can happen with:
1. Provisioned throughput models that are still initializing
2. Custom models that are being loaded
3. Models that are temporarily unavailable

Please try:
1. Wait a few minutes and retry
2. Check the model status in Amazon Bedrock console
3. Verify the model is properly provisioned

`,
			logLevel: "error",
		},
		INTERNAL_SERVER_ERROR: {
			patterns: ["internal server error", "internal error", "server error", "service error"],
			messageTemplate: `Amazon Bedrock internal server error. This is a temporary service issue.

Please try:
1. Retry the request after a brief delay
2. If the error persists, check AWS service health
3. Contact AWS support if the issue continues

`,
			logLevel: "error",
		},
		ON_DEMAND_NOT_SUPPORTED: {
			patterns: ["with on-demand throughput isn’t supported."],
			messageTemplate: `
1. Try enabling cross-region inference in settings.
2. Or, create an inference profile and then leverage the "Use custom ARN..." option of the model selector in settings.`,
			logLevel: "error",
		},
		ABORT: {
			patterns: ["aborterror"], // This will match error.name.toLowerCase() for AbortError
			messageTemplate: `Request was aborted: The operation timed out or was manually cancelled. Please try again or check your network connection.`,
			logLevel: "info",
		},
		INVALID_ARN_FORMAT: {
			patterns: ["invalid_arn_format:", "invalid arn format"],
			messageTemplate: `Invalid ARN format. ARN should follow the pattern: arn:aws:bedrock:region:account-id:resource-type/resource-name`,
			logLevel: "error",
		},
		VALIDATION_ERROR: {
			patterns: [
				"input tag",
				"does not match any of the expected tags",
				"field required",
				"validation",
				"invalid parameter",
			],
			messageTemplate: `Parameter validation error: {errorMessage}

This error indicates that the request parameters don't match Amazon Bedrock's expected format.

Common causes:
1. Extended thinking parameter format is incorrect
2. Model-specific parameters are not supported by this model
3. API parameter structure has changed

Please check:
- Model supports the requested features (extended thinking, etc.)
- Parameter format matches Amazon Bedrock specification
- Model ID is correct for the requested features`,
			logLevel: "error",
		},
		// Default/generic error
		GENERIC: {
			patterns: [], // Empty patterns array means this is the default
			messageTemplate: `Unknown Error: {errorMessage}`,
			logLevel: "error",
		},
	}
	/**
	 * Determines the error type based on the error message or name
	 */
	getErrorType(error) {
		if (!(error instanceof Error)) {
			return "GENERIC"
		}
		// Check for HTTP 429 status code (Too Many Requests)
		if (error.status === 429 || error.$metadata?.httpStatusCode === 429) {
			return "THROTTLING"
		}
		// Check for Amazon Bedrock specific throttling exception names
		if (error.name === "ThrottlingException" || error.__type === "ThrottlingException") {
			return "THROTTLING"
		}
		const errorMessage = error.message.toLowerCase()
		const errorName = error.name.toLowerCase()
		// Check each error type's patterns in order of specificity (most specific first)
		const errorTypeOrder = [
			"SERVICE_QUOTA_EXCEEDED", // Most specific - check before THROTTLING
			"MODEL_NOT_READY",
			"TOO_MANY_TOKENS",
			"INTERNAL_SERVER_ERROR",
			"ON_DEMAND_NOT_SUPPORTED",
			"NOT_FOUND",
			"ACCESS_DENIED",
			"THROTTLING", // Less specific - check after more specific patterns
		]
		for (const errorType of errorTypeOrder) {
			const definition = AwsBedrockHandler.ERROR_TYPES[errorType]
			if (!definition) continue
			// If any pattern matches in either message or name, return this error type
			if (definition.patterns.some((pattern) => errorMessage.includes(pattern) || errorName.includes(pattern))) {
				return errorType
			}
		}
		// Default to generic error
		return "GENERIC"
	}
	/**
	 * Formats an error message based on the error type and context
	 */
	formatErrorMessage(error, errorType, _isStreamContext) {
		const definition = AwsBedrockHandler.ERROR_TYPES[errorType] || AwsBedrockHandler.ERROR_TYPES.GENERIC
		let template = definition.messageTemplate
		// Prepare template variables
		const templateVars = {}
		if (error instanceof Error) {
			templateVars.errorMessage = error.message
			templateVars.errorName = error.name
			const modelConfig = this.getModel()
			templateVars.modelId = modelConfig.id
			templateVars.contextWindow = String(modelConfig.info.contextWindow || "unknown")
		}
		// Add context-specific template variables
		const region =
			typeof this?.client?.config?.region === "function"
				? this?.client?.config?.region()
				: this?.client?.config?.region
		templateVars.regionInfo = `(${region})`
		// Replace template variables
		for (const [key, value] of Object.entries(templateVars)) {
			template = template.replace(new RegExp(`{${key}}`, "g"), value || "")
		}
		return template
	}
	/**
	 * Handles Bedrock API errors and generates appropriate error messages
	 * @param error The error that occurred
	 * @param isStreamContext Whether the error occurred in a streaming context (true) or not (false)
	 * @returns Error message string for non-streaming context or array of stream chunks for streaming context
	 */
	handleBedrockError(error, isStreamContext) {
		// Determine error type
		const errorType = this.getErrorType(error)
		// Format error message
		const errorMessage = this.formatErrorMessage(error, errorType, isStreamContext)
		// Log the error
		const definition = AwsBedrockHandler.ERROR_TYPES[errorType]
		const logMethod = definition.logLevel
		const contextName = isStreamContext ? "createMessage" : "completePrompt"
		logging_1.logger[logMethod](`${errorType} error in ${contextName}`, {
			ctx: "bedrock",
			customArn: this.options.awsCustomArn,
			errorType,
			errorMessage: error instanceof Error ? error.message : String(error),
			...(error instanceof Error && error.stack ? { errorStack: error.stack } : {}),
			...(this.client?.config?.region ? { clientRegion: this.client.config.region } : {}),
		})
		// Return appropriate response based on isStreamContext
		if (isStreamContext) {
			return [
				{ type: "text", text: `Error: ${errorMessage}` },
				{ type: "usage", inputTokens: 0, outputTokens: 0 },
			]
		} else {
			// For non-streaming context, add the expected prefix
			return `Bedrock completion error: ${errorMessage}`
		}
	}
}
exports.AwsBedrockHandler = AwsBedrockHandler
