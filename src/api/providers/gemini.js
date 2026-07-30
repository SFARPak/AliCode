"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.GeminiHandler = void 0
const genai_1 = require("@google/genai")
const types_1 = require("@ali-code/types")
const core_1 = require("@ali-code/core")
const gemini_format_1 = require("../transform/gemini-format")
const i18next_1 = require("i18next")
const model_params_1 = require("../transform/model-params")
const base_provider_1 = require("./base-provider")
class GeminiHandler extends base_provider_1.BaseProvider {
	options
	client
	lastThoughtSignature
	lastResponseId
	providerName = "Gemini"
	constructor({ isVertex, ...options }) {
		super()
		this.options = options
		const project = this.options.vertexProjectId ?? "not-provided"
		const location = this.options.vertexRegion ?? "not-provided"
		const apiKey = this.options.geminiApiKey ?? "not-provided"
		this.client = this.options.vertexJsonCredentials
			? new genai_1.GoogleGenAI({
					vertexai: true,
					project,
					location,
					googleAuthOptions: {
						credentials: (0, core_1.safeJsonParse)(this.options.vertexJsonCredentials, undefined),
					},
				})
			: this.options.vertexKeyFile
				? new genai_1.GoogleGenAI({
						vertexai: true,
						project,
						location,
						googleAuthOptions: { keyFile: this.options.vertexKeyFile },
					})
				: isVertex
					? new genai_1.GoogleGenAI({ vertexai: true, project, location })
					: new genai_1.GoogleGenAI({ apiKey })
	}
	async *createMessage(systemInstruction, messages, metadata) {
		const { id: model, info, reasoning: thinkingConfig, maxTokens } = this.getModel()
		// Reset per-request metadata that we persist into apiConversationHistory.
		this.lastThoughtSignature = undefined
		this.lastResponseId = undefined
		// For hybrid/budget reasoning models (e.g. Gemini 2.5 Pro), respect user-configured
		// modelMaxTokens so the ThinkingBudget slider can control the cap. For effort-only or
		// standard models (like gemini-3-pro-preview), ignore any stale modelMaxTokens and
		// default to the model's computed maxTokens from getModelMaxOutputTokens.
		const isHybridReasoningModel = info.supportsReasoningBudget || info.requiredReasoningBudget
		const maxOutputTokens = isHybridReasoningModel
			? (this.options.modelMaxTokens ?? maxTokens ?? undefined)
			: (maxTokens ?? undefined)
		// Gemini 3 validates thought signatures for tool/function calling steps.
		// We must round-trip the signature when tools are in use, even if the user chose
		// a minimal thinking level (or thinkingConfig is otherwise absent).
		const includeThoughtSignatures = Boolean(thinkingConfig) || Boolean(metadata?.tools?.length)
		const geminiMessages = messages.filter((message) => {
			const meta = message
			if (meta.type === "reasoning") {
				return false
			}
			return true
		})
		// Build a map of tool IDs to names from previous messages
		// This is needed because Anthropic's tool_result blocks only contain the ID,
		// but Gemini requires the name in functionResponse
		const toolIdToName = new Map()
		for (const message of messages) {
			if (Array.isArray(message.content)) {
				for (const block of message.content) {
					if (block.type === "tool_use") {
						toolIdToName.set(block.id, block.name)
					}
				}
			}
		}
		const contents = geminiMessages
			.map((message) =>
				(0, gemini_format_1.convertAnthropicMessageToGemini)(message, {
					includeThoughtSignatures,
					toolIdToName,
				}),
			)
			.flat()
		// Tools are always present (minimum ALWAYS_AVAILABLE_TOOLS).
		// Google built-in tools (Grounding, URL Context) are mutually exclusive
		// with function declarations in the Gemini API, so we always use
		// function declarations when tools are provided.
		const tools = [
			{
				functionDeclarations: (metadata?.tools ?? []).map((tool) => ({
					name: tool.function.name,
					description: tool.function.description,
					parametersJsonSchema: tool.function.parameters,
				})),
			},
		]
		// Determine temperature respecting model capabilities and defaults:
		// - If supportsTemperature is explicitly false, ignore user overrides
		//   and pin to the model's defaultTemperature (or omit if undefined).
		// - Otherwise, allow the user setting to override, falling back to model default,
		//   then to 1 for Gemini provider default.
		const supportsTemperature = info.supportsTemperature !== false
		const temperatureConfig = supportsTemperature
			? (this.options.modelTemperature ?? info.defaultTemperature ?? 1)
			: info.defaultTemperature
		const config = {
			systemInstruction,
			httpOptions: this.options.googleGeminiBaseUrl ? { baseUrl: this.options.googleGeminiBaseUrl } : undefined,
			thinkingConfig,
			maxOutputTokens,
			temperature: temperatureConfig,
			...(tools.length > 0 ? { tools } : {}),
		}
		// Handle allowedFunctionNames for mode-restricted tool access.
		// When provided, all tool definitions are passed to the model (so it can reference
		// historical tool calls in conversation), but only the specified tools can be invoked.
		// This takes precedence over tool_choice to ensure mode restrictions are honored.
		if (metadata?.allowedFunctionNames && metadata.allowedFunctionNames.length > 0) {
			config.toolConfig = {
				functionCallingConfig: {
					// Use ANY mode to allow calling any of the allowed functions
					mode: genai_1.FunctionCallingConfigMode.ANY,
					allowedFunctionNames: metadata.allowedFunctionNames,
				},
			}
		} else if (metadata?.tool_choice) {
			const choice = metadata.tool_choice
			let mode
			let allowedFunctionNames
			if (choice === "auto") {
				mode = genai_1.FunctionCallingConfigMode.AUTO
			} else if (choice === "none") {
				mode = genai_1.FunctionCallingConfigMode.NONE
			} else if (choice === "required") {
				// "required" means the model must call at least one tool; Gemini uses ANY for this.
				mode = genai_1.FunctionCallingConfigMode.ANY
			} else if (typeof choice === "object" && "function" in choice && choice.type === "function") {
				mode = genai_1.FunctionCallingConfigMode.ANY
				allowedFunctionNames = [choice.function.name]
			} else {
				// Fall back to AUTO for unknown values to avoid unintentionally broadening tool access.
				mode = genai_1.FunctionCallingConfigMode.AUTO
			}
			config.toolConfig = {
				functionCallingConfig: {
					mode,
					...(allowedFunctionNames ? { allowedFunctionNames } : {}),
				},
			}
		}
		const params = { model, contents, config }
		try {
			const result = await this.client.models.generateContentStream(params)
			let lastUsageMetadata
			let pendingGroundingMetadata
			let finalResponse
			let finishReason
			let toolCallCounter = 0
			let hasContent = false
			let hasReasoning = false
			for await (const chunk of result) {
				// Track the final structured response (per SDK pattern: candidate.finishReason)
				if (chunk.candidates && chunk.candidates[0]?.finishReason) {
					finalResponse = chunk
					finishReason = chunk.candidates[0].finishReason
				}
				// Process candidates and their parts to separate thoughts from content
				if (chunk.candidates && chunk.candidates.length > 0) {
					const candidate = chunk.candidates[0]
					if (candidate.groundingMetadata) {
						pendingGroundingMetadata = candidate.groundingMetadata
					}
					if (candidate.content && candidate.content.parts) {
						for (const part of candidate.content.parts) {
							// Capture thought signatures so they can be persisted into API history.
							const thoughtSignature = part.thoughtSignature
							// Persist thought signatures so they can be round-tripped in the next step.
							// Gemini 3 requires this during tool calling; other Gemini thinking models
							// benefit from it for continuity.
							if (includeThoughtSignatures && thoughtSignature) {
								this.lastThoughtSignature = thoughtSignature
							}
							if (part.thought) {
								// This is a thinking/reasoning part
								if (part.text) {
									hasReasoning = true
									yield { type: "reasoning", text: part.text }
								}
							} else if (part.functionCall) {
								hasContent = true
								// Gemini sends complete function calls in a single chunk
								// Emit as partial chunks for consistent handling with NativeToolCallParser
								const callId = `${part.functionCall.name}-${toolCallCounter}`
								const args = JSON.stringify(part.functionCall.args)
								// Emit name first
								yield {
									type: "tool_call_partial",
									index: toolCallCounter,
									id: callId,
									name: part.functionCall.name,
									arguments: undefined,
								}
								// Then emit arguments
								yield {
									type: "tool_call_partial",
									index: toolCallCounter,
									id: callId,
									name: undefined,
									arguments: args,
								}
								toolCallCounter++
							} else {
								// This is regular content
								if (part.text) {
									hasContent = true
									yield { type: "text", text: part.text }
								}
							}
						}
					}
				}
				// Fallback to the original text property if no candidates structure
				else if (chunk.text) {
					hasContent = true
					yield { type: "text", text: chunk.text }
				}
				if (chunk.usageMetadata) {
					lastUsageMetadata = chunk.usageMetadata
				}
			}
			if (finalResponse?.responseId) {
				// Capture responseId so Task.addToApiConversationHistory can store it
				// alongside the assistant message in api_history.json.
				this.lastResponseId = finalResponse.responseId
			}
			if (pendingGroundingMetadata) {
				const sources = this.extractGroundingSources(pendingGroundingMetadata)
				if (sources.length > 0) {
					yield { type: "grounding", sources }
				}
			}
			if (lastUsageMetadata) {
				const inputTokens = lastUsageMetadata.promptTokenCount ?? 0
				const outputTokens = lastUsageMetadata.candidatesTokenCount ?? 0
				const cacheReadTokens = lastUsageMetadata.cachedContentTokenCount
				const reasoningTokens = lastUsageMetadata.thoughtsTokenCount
				yield {
					type: "usage",
					inputTokens,
					outputTokens,
					cacheReadTokens,
					reasoningTokens,
					totalCost: this.calculateCost({
						info,
						inputTokens,
						outputTokens,
						cacheReadTokens,
						reasoningTokens,
					}),
				}
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			if (error instanceof Error) {
				throw new Error((0, i18next_1.t)("common:errors.gemini.generate_stream", { error: error.message }))
			}
			throw error
		}
	}
	getModel() {
		const modelId = this.options.apiModelId
		let id = modelId && modelId in types_1.geminiModels ? modelId : types_1.geminiDefaultModelId
		let info = types_1.geminiModels[id]
		const params = (0, model_params_1.getModelParams)({
			format: "gemini",
			modelId: id,
			model: info,
			settings: this.options,
			defaultTemperature: info.defaultTemperature ?? 1,
		})
		// Gemini models perform better with the edit tool instead of apply_diff.
		info = {
			...info,
			excludedTools: [...new Set([...(info.excludedTools || []), "apply_diff"])],
			includedTools: [...new Set([...(info.includedTools || []), "edit"])],
		}
		// The `:thinking` suffix indicates that the model is a "Hybrid"
		// reasoning model and that reasoning is required to be enabled.
		// The actual model ID honored by Gemini's API does not have this
		// suffix.
		return { id: id.endsWith(":thinking") ? id.replace(":thinking", "") : id, info, ...params }
	}
	extractGroundingSources(groundingMetadata) {
		const chunks = groundingMetadata?.groundingChunks
		if (!chunks) {
			return []
		}
		return chunks
			.map((chunk) => {
				const uri = chunk.web?.uri
				const title = chunk.web?.title || uri || "Unknown Source"
				if (uri) {
					return {
						title,
						url: uri,
					}
				}
				return null
			})
			.filter((source) => source !== null)
	}
	extractCitationsOnly(groundingMetadata) {
		const sources = this.extractGroundingSources(groundingMetadata)
		if (sources.length === 0) {
			return null
		}
		const citationLinks = sources.map((source, i) => `[${i + 1}](${source.url})`)
		return citationLinks.join(", ")
	}
	async completePrompt(prompt) {
		const { id: model, info } = this.getModel()
		try {
			const supportsTemperature = info.supportsTemperature !== false
			const temperatureConfig = supportsTemperature
				? (this.options.modelTemperature ?? info.defaultTemperature ?? 1)
				: info.defaultTemperature
			const promptConfig = {
				httpOptions: this.options.googleGeminiBaseUrl
					? { baseUrl: this.options.googleGeminiBaseUrl }
					: undefined,
				temperature: temperatureConfig,
			}
			const request = {
				model,
				contents: [{ role: "user", parts: [{ text: prompt }] }],
				config: promptConfig,
			}
			const result = await this.client.models.generateContent(request)
			let text = result.text ?? ""
			const candidate = result.candidates?.[0]
			if (candidate?.groundingMetadata) {
				const citations = this.extractCitationsOnly(candidate.groundingMetadata)
				if (citations) {
					text += `\n\n${(0, i18next_1.t)("common:errors.gemini.sources")} ${citations}`
				}
			}
			return text
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error)
			if (error instanceof Error) {
				throw new Error(
					(0, i18next_1.t)("common:errors.gemini.generate_complete_prompt", { error: error.message }),
				)
			}
			throw error
		}
	}
	getThoughtSignature() {
		return this.lastThoughtSignature
	}
	getResponseId() {
		return this.lastResponseId
	}
	calculateCost({ info, inputTokens, outputTokens, cacheReadTokens = 0, reasoningTokens = 0 }) {
		// For models with tiered pricing, prices might only be defined in tiers
		let inputPrice = info.inputPrice
		let outputPrice = info.outputPrice
		let cacheReadsPrice = info.cacheReadsPrice
		// If there's tiered pricing then adjust the input and output token prices
		// based on the input tokens used.
		if (info.tiers) {
			const tier = info.tiers.find((tier) => inputTokens <= tier.contextWindow)
			if (tier) {
				inputPrice = tier.inputPrice ?? inputPrice
				outputPrice = tier.outputPrice ?? outputPrice
				cacheReadsPrice = tier.cacheReadsPrice ?? cacheReadsPrice
			}
		}
		// Check if we have the required prices after considering tiers
		if (!inputPrice || !outputPrice) {
			return undefined
		}
		// cacheReadsPrice is optional - if not defined, treat as 0
		if (!cacheReadsPrice) {
			cacheReadsPrice = 0
		}
		// Subtract the cached input tokens from the total input tokens.
		const uncachedInputTokens = inputTokens - cacheReadTokens
		// Bill both completion and reasoning ("thoughts") tokens as output.
		const billedOutputTokens = outputTokens + reasoningTokens
		let cacheReadCost = cacheReadTokens > 0 ? cacheReadsPrice * (cacheReadTokens / 1_000_000) : 0
		const inputTokensCost = inputPrice * (uncachedInputTokens / 1_000_000)
		const outputTokensCost = outputPrice * (billedOutputTokens / 1_000_000)
		const totalCost = inputTokensCost + outputTokensCost + cacheReadCost
		const trace = {
			input: { price: inputPrice, tokens: uncachedInputTokens, cost: inputTokensCost },
			output: { price: outputPrice, tokens: billedOutputTokens, cost: outputTokensCost },
		}
		if (cacheReadTokens > 0) {
			trace.cacheRead = { price: cacheReadsPrice, tokens: cacheReadTokens, cost: cacheReadCost }
		}
		return totalCost
	}
}
exports.GeminiHandler = GeminiHandler
