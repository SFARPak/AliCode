import type { ModelRecord } from "@ali-code/types"
/**
 * Fetches available models from a LiteLLM server
 *
 * @param apiKey The API key for the LiteLLM server
 * @param baseUrl The base URL of the LiteLLM server
 * @returns A promise that resolves to a record of model IDs to model info
 * @throws Will throw an error if the request fails or the response is not as expected.
 */
export declare function getLiteLLMModels(apiKey: string, baseUrl: string): Promise<ModelRecord>
//# sourceMappingURL=litellm.d.ts.map
