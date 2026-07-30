import { type NvidiaNimModelId } from "@ali-code/types"
import type { ApiHandlerOptions } from "../../shared/api"
import { BaseOpenAiCompatibleProvider } from "./base-openai-compatible-provider"
export declare class NvidiaNimHandler extends BaseOpenAiCompatibleProvider<NvidiaNimModelId> {
	/**
	 * NVIDIA NIM provider supports the full catalog of model identifiers.
	 * It forwards the model name from the request payload directly to the NVIDIA endpoint.
	 */
	constructor(options: ApiHandlerOptions)
	/**
	 * Override model resolution to allow any model identifier.
	 * If an explicit apiModelId is provided, it is used verbatim, bypassing the predefined list.
	 */
	getModel(): {
		id: string
		info: any
	}
}
//# sourceMappingURL=nvidia-nim.d.ts.map
