import type { ModelInfo } from "@ali-code/types"
/**
 * Apply tool preferences for models accessed through dynamic routers (OpenRouter, Requesty).
 *
 * Different model families perform better with specific tools:
 * - OpenAI models: Better results with apply_patch instead of apply_diff/write_to_file
 *
 * This function modifies the model info to apply these preferences consistently
 * across all dynamic router providers.
 *
 * @param modelId The model identifier (e.g., "openai/gpt-4", "google/gemini-2.5-pro")
 * @param info The original model info object
 * @returns A new model info object with tool preferences applied
 */
export declare function applyRouterToolPreferences(modelId: string, info: ModelInfo): ModelInfo
//# sourceMappingURL=router-tool-preferences.d.ts.map
