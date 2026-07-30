import { LLMInfo, LLMInstanceInfo } from "@lmstudio/sdk"
import { type ModelInfo } from "@ali-code/types"
export declare const hasLoadedFullDetails: (modelId: string) => boolean
export declare const forceFullModelDetailsLoad: (baseUrl: string, modelId: string) => Promise<void>
export declare const parseLMStudioModel: (rawModel: LLMInstanceInfo | LLMInfo) => ModelInfo
export declare function getLMStudioModels(baseUrl?: string): Promise<Record<string, ModelInfo>>
//# sourceMappingURL=lmstudio.d.ts.map
