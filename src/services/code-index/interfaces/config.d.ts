import { ApiHandlerOptions } from "../../../shared/api"
import { EmbedderProvider } from "./manager"
/**
 * Configuration state for the code indexing feature
 */
export interface CodeIndexConfig {
	isConfigured: boolean
	embedderProvider: EmbedderProvider
	modelId?: string
	modelDimension?: number
	openAiOptions?: ApiHandlerOptions
	ollamaOptions?: ApiHandlerOptions
	openAiCompatibleOptions?: {
		baseUrl: string
		apiKey: string
	}
	geminiOptions?: {
		apiKey: string
	}
	mistralOptions?: {
		apiKey: string
	}
	vercelAiGatewayOptions?: {
		apiKey: string
	}
	bedrockOptions?: {
		region: string
		profile?: string
	}
	openRouterOptions?: {
		apiKey: string
		specificProvider?: string
	}
	qdrantUrl?: string
	qdrantApiKey?: string
	searchMinScore?: number
	searchMaxResults?: number
}
/**
 * Snapshot of previous configuration used to determine if a restart is required
 */
export type PreviousConfigSnapshot = {
	enabled: boolean
	configured: boolean
	embedderProvider: EmbedderProvider
	modelId?: string
	modelDimension?: number
	openAiKey?: string
	ollamaBaseUrl?: string
	openAiCompatibleBaseUrl?: string
	openAiCompatibleApiKey?: string
	geminiApiKey?: string
	mistralApiKey?: string
	vercelAiGatewayApiKey?: string
	bedrockRegion?: string
	bedrockProfile?: string
	openRouterApiKey?: string
	openRouterSpecificProvider?: string
	qdrantUrl?: string
	qdrantApiKey?: string
}
//# sourceMappingURL=config.d.ts.map
