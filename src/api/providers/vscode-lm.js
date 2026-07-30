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
exports.VsCodeLmHandler = void 0
exports.getVsCodeLmModels = getVsCodeLmModels
const vscode = __importStar(require("vscode"))
const types_1 = require("@ali-code/types")
const vsCodeSelectorUtils_1 = require("../../shared/vsCodeSelectorUtils")
const json_schema_1 = require("../../utils/json-schema")
const vscode_lm_format_1 = require("../transform/vscode-lm-format")
const base_provider_1 = require("./base-provider")
/**
 * Converts OpenAI-format tools to VSCode Language Model tools.
 * Normalizes the JSON Schema to draft 2020-12 compliant format required by
 * GitHub Copilot's backend, converting type: ["T", "null"] to anyOf format.
 * @param tools Array of OpenAI ChatCompletionTool definitions
 * @returns Array of VSCode LanguageModelChatTool definitions
 */
function convertToVsCodeLmTools(tools) {
	return tools
		.filter((tool) => tool.type === "function")
		.map((tool) => ({
			name: tool.function.name,
			description: tool.function.description || "",
			inputSchema: tool.function.parameters
				? (0, json_schema_1.normalizeToolSchema)(tool.function.parameters)
				: undefined,
		}))
}
/**
 * Handles interaction with VS Code's Language Model API for chat-based operations.
 * This handler extends BaseProvider to provide VS Code LM specific functionality.
 *
 * @extends {BaseProvider}
 *
 * @remarks
 * The handler manages a VS Code language model chat client and provides methods to:
 * - Create and manage chat client instances
 * - Stream messages using VS Code's Language Model API
 * - Retrieve model information
 *
 * @example
 * ```typescript
 * const options = {
 *   vsCodeLmModelSelector: { vendor: "copilot", family: "gpt-4" }
 * };
 * const handler = new VsCodeLmHandler(options);
 *
 * // Stream a conversation
 * const systemPrompt = "You are a helpful assistant";
 * const messages = [{ role: "user", content: "Hello!" }];
 * for await (const chunk of handler.createMessage(systemPrompt, messages)) {
 *   console.log(chunk);
 * }
 * ```
 */
class VsCodeLmHandler extends base_provider_1.BaseProvider {
	options
	client
	disposable
	currentRequestCancellation
	constructor(options) {
		super()
		this.options = options
		this.client = null
		this.disposable = null
		this.currentRequestCancellation = null
		try {
			// Listen for model changes and reset client
			this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
				if (event.affectsConfiguration("lm")) {
					try {
						this.client = null
						this.ensureCleanState()
					} catch (error) {
						console.error("Error during configuration change cleanup:", error)
					}
				}
			})
			this.initializeClient()
		} catch (error) {
			// Ensure cleanup if constructor fails
			this.dispose()
			throw new Error(
				`AliCode <Language Model API>: Failed to initialize handler: ${error instanceof Error ? error.message : "Unknown error"}`,
			)
		}
	}
	/**
	 * Initializes the VS Code Language Model client.
	 * This method is called during the constructor to set up the client.
	 * This useful when the client is not created yet and call getModel() before the client is created.
	 * @returns Promise<void>
	 * @throws Error when client initialization fails
	 */
	async initializeClient() {
		try {
			// Check if the client is already initialized
			if (this.client) {
				console.debug("AliCode <Language Model API>: Client already initialized")
				return
			}
			// Create a new client instance
			this.client = await this.createClient(this.options.vsCodeLmModelSelector || {})
			console.debug("AliCode <Language Model API>: Client initialized successfully")
		} catch (error) {
			// Handle errors during client initialization
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			console.error("AliCode <Language Model API>: Client initialization failed:", errorMessage)
			throw new Error(`AliCode <Language Model API>: Failed to initialize client: ${errorMessage}`)
		}
	}
	/**
	 * Creates a language model chat client based on the provided selector.
	 *
	 * @param selector - Selector criteria to filter language model chat instances
	 * @returns Promise resolving to the first matching language model chat instance
	 * @throws Error when no matching models are found with the given selector
	 *
	 * @example
	 * const selector = { vendor: "copilot", family: "gpt-4o" };
	 * const chatClient = await createClient(selector);
	 */
	async createClient(selector) {
		try {
			const models = await vscode.lm.selectChatModels(selector)
			// Use first available model or create a minimal model object
			if (models && Array.isArray(models) && models.length > 0) {
				return models[0]
			}
			// Create a minimal model if no models are available
			return {
				id: "default-lm",
				name: "Default Language Model",
				vendor: "vscode",
				family: "lm",
				version: "1.0",
				maxInputTokens: 8192,
				sendRequest: async (_messages, _options, _token) => {
					// Provide a minimal implementation
					return {
						stream: (async function* () {
							yield new vscode.LanguageModelTextPart(
								"Language model functionality is limited. Please check VS Code configuration.",
							)
						})(),
						text: (async function* () {
							yield "Language model functionality is limited. Please check VS Code configuration."
						})(),
					}
				},
				countTokens: async () => 0,
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			throw new Error(`AliCode <Language Model API>: Failed to select model: ${errorMessage}`)
		}
	}
	/**
	 * Creates and streams a message using the VS Code Language Model API.
	 *
	 * @param systemPrompt - The system prompt to initialize the conversation context
	 * @param messages - An array of message parameters following the Anthropic message format
	 * @param metadata - Optional metadata for the message
	 *
	 * @yields {ApiStream} An async generator that yields either text chunks or tool calls from the model response
	 *
	 * @throws {Error} When vsCodeLmModelSelector option is not provided
	 * @throws {Error} When the response stream encounters an error
	 *
	 * @remarks
	 * This method handles the initialization of the VS Code LM client if not already created,
	 * converts the messages to VS Code LM format, and streams the response chunks.
	 * Tool calls handling is currently a work in progress.
	 */
	dispose() {
		if (this.disposable) {
			this.disposable.dispose()
		}
		if (this.currentRequestCancellation) {
			this.currentRequestCancellation.cancel()
			this.currentRequestCancellation.dispose()
		}
	}
	/**
	 * Implements the ApiHandler countTokens interface method
	 * Provides token counting for Anthropic content blocks
	 *
	 * @param content The content blocks to count tokens for
	 * @returns A promise resolving to the token count
	 */
	async countTokens(content) {
		// Convert Anthropic content blocks to a string for VSCode LM token counting
		let textContent = ""
		for (const block of content) {
			if (block.type === "text") {
				textContent += block.text || ""
			} else if (block.type === "image") {
				// VSCode LM doesn't support images directly, so we'll just use a placeholder
				textContent += "[IMAGE]"
			}
		}
		return this.internalCountTokens(textContent)
	}
	/**
	 * Private implementation of token counting used internally by VsCodeLmHandler
	 */
	async internalCountTokens(text) {
		// Check for required dependencies
		if (!this.client) {
			console.warn("AliCode <Language Model API>: No client available for token counting")
			return 0
		}
		// Validate input
		if (!text) {
			console.debug("AliCode <Language Model API>: Empty text provided for token counting")
			return 0
		}
		// Create a temporary cancellation token if we don't have one (e.g., when called outside a request)
		let cancellationToken
		let tempCancellation = null
		if (this.currentRequestCancellation) {
			cancellationToken = this.currentRequestCancellation.token
		} else {
			tempCancellation = new vscode.CancellationTokenSource()
			cancellationToken = tempCancellation.token
		}
		try {
			// Handle different input types
			let tokenCount
			if (typeof text === "string") {
				tokenCount = await this.client.countTokens(text, cancellationToken)
			} else if (text instanceof vscode.LanguageModelChatMessage) {
				// For chat messages, ensure we have content
				if (!text.content || (Array.isArray(text.content) && text.content.length === 0)) {
					console.debug("AliCode <Language Model API>: Empty chat message content")
					return 0
				}
				const countMessage = (0, vscode_lm_format_1.extractTextCountFromMessage)(text)
				tokenCount = await this.client.countTokens(countMessage, cancellationToken)
			} else {
				console.warn("AliCode <Language Model API>: Invalid input type for token counting")
				return 0
			}
			// Validate the result
			if (typeof tokenCount !== "number") {
				console.warn("AliCode <Language Model API>: Non-numeric token count received:", tokenCount)
				return 0
			}
			if (tokenCount < 0) {
				console.warn("AliCode <Language Model API>: Negative token count received:", tokenCount)
				return 0
			}
			return tokenCount
		} catch (error) {
			// Handle specific error types
			if (error instanceof vscode.CancellationError) {
				console.debug("AliCode <Language Model API>: Token counting cancelled by user")
				return 0
			}
			const errorMessage = error instanceof Error ? error.message : "Unknown error"
			console.warn("AliCode <Language Model API>: Token counting failed:", errorMessage)
			// Log additional error details if available
			if (error instanceof Error && error.stack) {
				console.debug("Token counting error stack:", error.stack)
			}
			return 0 // Fallback to prevent stream interruption
		} finally {
			// Clean up temporary cancellation token
			if (tempCancellation) {
				tempCancellation.dispose()
			}
		}
	}
	async calculateTotalInputTokens(vsCodeLmMessages) {
		const messageTokens = await Promise.all(vsCodeLmMessages.map((msg) => this.internalCountTokens(msg)))
		return messageTokens.reduce((sum, tokens) => sum + tokens, 0)
	}
	ensureCleanState() {
		if (this.currentRequestCancellation) {
			this.currentRequestCancellation.cancel()
			this.currentRequestCancellation.dispose()
			this.currentRequestCancellation = null
		}
	}
	async getClient() {
		if (!this.client) {
			console.debug("AliCode <Language Model API>: Getting client with options:", {
				vsCodeLmModelSelector: this.options.vsCodeLmModelSelector,
				hasOptions: !!this.options,
				selectorKeys: this.options.vsCodeLmModelSelector ? Object.keys(this.options.vsCodeLmModelSelector) : [],
			})
			try {
				// Use default empty selector if none provided to get all available models
				const selector = this.options?.vsCodeLmModelSelector || {}
				console.debug("AliCode <Language Model API>: Creating client with selector:", selector)
				this.client = await this.createClient(selector)
			} catch (error) {
				const message = error instanceof Error ? error.message : "Unknown error"
				console.error("AliCode <Language Model API>: Client creation failed:", message)
				throw new Error(`AliCode <Language Model API>: Failed to create client: ${message}`)
			}
		}
		return this.client
	}
	cleanMessageContent(content) {
		if (!content) {
			return content
		}
		if (typeof content === "string") {
			return content
		}
		if (Array.isArray(content)) {
			return content.map((item) => this.cleanMessageContent(item))
		}
		if (typeof content === "object") {
			const cleaned = {}
			for (const [key, value] of Object.entries(content)) {
				cleaned[key] = this.cleanMessageContent(value)
			}
			return cleaned
		}
		return content
	}
	async *createMessage(systemPrompt, messages, metadata) {
		// Ensure clean state before starting a new request
		this.ensureCleanState()
		const client = await this.getClient()
		// Process messages
		const cleanedMessages = messages.map((msg) => ({
			...msg,
			content: this.cleanMessageContent(msg.content),
		}))
		// Convert Anthropic messages to VS Code LM messages
		const vsCodeLmMessages = [
			vscode.LanguageModelChatMessage.Assistant(systemPrompt),
			...(0, vscode_lm_format_1.convertToVsCodeLmMessages)(cleanedMessages),
		]
		// Initialize cancellation token for the request
		this.currentRequestCancellation = new vscode.CancellationTokenSource()
		// Calculate input tokens before starting the stream
		const totalInputTokens = await this.calculateTotalInputTokens(vsCodeLmMessages)
		// Accumulate the text and count at the end of the stream to reduce token counting overhead.
		let accumulatedText = ""
		try {
			// Create the response stream with required options
			const requestOptions = {
				justification: `AliCode would like to use '${client.name}' from '${client.vendor}', Click 'Allow' to proceed.`,
				tools: convertToVsCodeLmTools(metadata?.tools ?? []),
			}
			const response = await client.sendRequest(
				vsCodeLmMessages,
				requestOptions,
				this.currentRequestCancellation.token,
			)
			// Consume the stream and handle both text and tool call chunks
			for await (const chunk of response.stream) {
				if (chunk instanceof vscode.LanguageModelTextPart) {
					// Validate text part value
					if (typeof chunk.value !== "string") {
						console.warn("AliCode <Language Model API>: Invalid text part value received:", chunk.value)
						continue
					}
					accumulatedText += chunk.value
					yield {
						type: "text",
						text: chunk.value,
					}
				} else if (chunk instanceof vscode.LanguageModelToolCallPart) {
					try {
						// Validate tool call parameters
						if (!chunk.name || typeof chunk.name !== "string") {
							console.warn("AliCode <Language Model API>: Invalid tool name received:", chunk.name)
							continue
						}
						if (!chunk.callId || typeof chunk.callId !== "string") {
							console.warn("AliCode <Language Model API>: Invalid tool callId received:", chunk.callId)
							continue
						}
						// Ensure input is a valid object
						if (!chunk.input || typeof chunk.input !== "object") {
							console.warn("AliCode <Language Model API>: Invalid tool input received:", chunk.input)
							continue
						}
						// Log tool call for debugging
						console.debug("AliCode <Language Model API>: Processing tool call:", {
							name: chunk.name,
							callId: chunk.callId,
							inputSize: JSON.stringify(chunk.input).length,
						})
						// Yield native tool_call chunk when tools are provided
						if (metadata?.tools?.length) {
							const argumentsString = JSON.stringify(chunk.input)
							accumulatedText += argumentsString
							yield {
								type: "tool_call",
								id: chunk.callId,
								name: chunk.name,
								arguments: argumentsString,
							}
						}
					} catch (error) {
						console.error("AliCode <Language Model API>: Failed to process tool call:", error)
						// Continue processing other chunks even if one fails
						continue
					}
				} else {
					console.warn("AliCode <Language Model API>: Unknown chunk type received:", chunk)
				}
			}
			// Count tokens in the accumulated text after stream completion
			const totalOutputTokens = await this.internalCountTokens(accumulatedText)
			// Report final usage after stream completion
			yield {
				type: "usage",
				inputTokens: totalInputTokens,
				outputTokens: totalOutputTokens,
			}
		} catch (error) {
			this.ensureCleanState()
			if (error instanceof vscode.CancellationError) {
				throw new Error("AliCode <Language Model API>: Request cancelled by user")
			}
			if (error instanceof Error) {
				console.error("AliCode <Language Model API>: Stream error details:", {
					message: error.message,
					stack: error.stack,
					name: error.name,
				})
				// Return original error if it's already an Error instance
				throw error
			} else if (typeof error === "object" && error !== null) {
				// Handle error-like objects
				const errorDetails = JSON.stringify(error, null, 2)
				console.error("AliCode <Language Model API>: Stream error object:", errorDetails)
				throw new Error(`AliCode <Language Model API>: Response stream error: ${errorDetails}`)
			} else {
				// Fallback for unknown error types
				const errorMessage = String(error)
				console.error("AliCode <Language Model API>: Unknown stream error:", errorMessage)
				throw new Error(`AliCode <Language Model API>: Response stream error: ${errorMessage}`)
			}
		}
	}
	// Return model information based on the current client state
	getModel() {
		if (this.client) {
			// Validate client properties
			const requiredProps = {
				id: this.client.id,
				vendor: this.client.vendor,
				family: this.client.family,
				version: this.client.version,
				maxInputTokens: this.client.maxInputTokens,
			}
			// Log any missing properties for debugging
			for (const [prop, value] of Object.entries(requiredProps)) {
				if (!value && value !== 0) {
					console.warn(`AliCode <Language Model API>: Client missing ${prop} property`)
				}
			}
			// Construct model ID using available information
			const modelParts = [this.client.vendor, this.client.family, this.client.version].filter(Boolean)
			const modelId = this.client.id || modelParts.join(vsCodeSelectorUtils_1.SELECTOR_SEPARATOR)
			// Build model info with conservative defaults for missing values
			const modelInfo = {
				maxTokens: -1, // Unlimited tokens by default
				contextWindow:
					typeof this.client.maxInputTokens === "number"
						? Math.max(0, this.client.maxInputTokens)
						: types_1.openAiModelInfoSaneDefaults.contextWindow,
				supportsImages: false, // VSCode Language Model API currently doesn't support image inputs
				supportsPromptCache: true,
				inputPrice: 0,
				outputPrice: 0,
				description: `VSCode Language Model: ${modelId}`,
			}
			return { id: modelId, info: modelInfo }
		}
		// Fallback when no client is available
		const fallbackId = this.options.vsCodeLmModelSelector
			? (0, vsCodeSelectorUtils_1.stringifyVsCodeLmModelSelector)(this.options.vsCodeLmModelSelector)
			: "vscode-lm"
		console.debug("AliCode <Language Model API>: No client available, using fallback model info")
		return {
			id: fallbackId,
			info: {
				...types_1.openAiModelInfoSaneDefaults,
				description: `VSCode Language Model (Fallback): ${fallbackId}`,
			},
		}
	}
	async completePrompt(prompt) {
		try {
			const client = await this.getClient()
			const response = await client.sendRequest(
				[vscode.LanguageModelChatMessage.User(prompt)],
				{},
				new vscode.CancellationTokenSource().token,
			)
			let result = ""
			for await (const chunk of response.stream) {
				if (chunk instanceof vscode.LanguageModelTextPart) {
					result += chunk.value
				}
			}
			return result
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`VSCode LM completion error: ${error.message}`)
			}
			throw error
		}
	}
}
exports.VsCodeLmHandler = VsCodeLmHandler
// Static blacklist of VS Code Language Model IDs that should be excluded from the model list e.g. because they will never work
const VSCODE_LM_STATIC_BLACKLIST = ["claude-3.7-sonnet", "claude-3.7-sonnet-thought"]
async function getVsCodeLmModels() {
	try {
		const models = (await vscode.lm.selectChatModels({})) || []
		return models.filter((model) => !VSCODE_LM_STATIC_BLACKLIST.includes(model.id))
	} catch (error) {
		console.error(
			`Error fetching VS Code LM models: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
		)
		return []
	}
}
