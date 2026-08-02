import { type NvidiaNimModelId, nvidiaNimDefaultModelId, nvidiaNimModels } from "@ali-code/types"

import type { ApiHandlerOptions } from "../../shared/api"
import type { ApiHandlerCreateMessageMetadata } from "../index"

import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { handleOpenAIError } from "./utils/openai-error-handler"
import { getModelMaxOutputTokens } from "../../shared/api"
import OpenAI from "openai"

export class NvidiaNimHandler extends BaseOpenAiCompatibleProvider<NvidiaNimModelId> {
	/**
	 * NVIDIA NIM provider supports the full catalog of model identifiers.
	 * It forwards the model name from the request payload directly to the NVIDIA endpoint.
	 */
	constructor(options: ApiHandlerOptions) {
		super({
			...options,
			providerName: "NVIDIA NIM",
			baseURL: options.nvidiaNimBaseUrl || "https://integrate.api.nvidia.com/v1",
			apiKey: options.nvidiaNimApiKey ?? "not-provided",
			defaultProviderModelId: nvidiaNimDefaultModelId,
			providerModels: nvidiaNimModels,
			defaultTemperature: 0,
		})
	}

	/**
	 * Override model resolution to allow any model identifier.
	 * If an explicit apiModelId is provided, it is used verbatim, bypassing the predefined list.
	 */
	override getModel() {
		const id = (this.options.apiModelId as string) || (this.defaultProviderModelId as string)
		// Return a generic ModelInfo shape if the model is not in the known list.
		const info = (this.providerModels as Record<string, any>)[id] || {}
		return { id, info }
	}

	/**
	 * NVIDIA NIM is OpenAI-compatible, but not all models accept every OpenAI
	 * parameter. To maximize compatibility across the catalog, we avoid sending
	 * optional fields that some endpoints reject.
	 */
	protected createStream(
		systemPrompt: string,
		messages: import("@anthropic-ai/sdk").Messages.MessageParam[],
		metadata?: ApiHandlerCreateMessageMetadata,
		requestOptions?: OpenAI.RequestOptions,
	) {
		const { id: model, info } = this.getModel()

		const max_tokens =
			getModelMaxOutputTokens({
				modelId: model,
				model: info,
				settings: this.options,
				format: "openai",
			}) ?? undefined

		const temperature = this.options.modelTemperature ?? info.defaultTemperature ?? this.defaultTemperature

		const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
			model,
			...(max_tokens ? { max_tokens } : {}),
			temperature,
			messages: [{ role: "system", content: systemPrompt }, ...convertToOpenAiMessages(messages)],
			stream: true,
			stream_options: { include_usage: true },
			...(metadata?.tools ? { tools: this.convertToolsForOpenAI(metadata.tools) } : {}),
			...(metadata?.tool_choice ? { tool_choice: metadata.tool_choice } : {}),
		}

		// Add thinking parameter if reasoning is enabled and model supports it
		if (this.options.enableReasoningEffort && info.supportsReasoningBinary) {
			;(params as any).thinking = { type: "enabled" }
		}

		try {
			return this.client.chat.completions.create(params, requestOptions)
		} catch (error) {
			throw handleOpenAIError(error, this.providerName)
		}
	}
}
