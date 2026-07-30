/**
 * Defines profiles for different embedding models, including their dimensions.
 */
import type { EmbedderProvider, EmbeddingModelProfiles } from "@ali-code/types"
export declare const EMBEDDING_MODEL_PROFILES: EmbeddingModelProfiles
/**
 * Retrieves the embedding dimension for a given provider and model ID.
 * @param provider The embedder provider (e.g., "openai").
 * @param modelId The specific model ID (e.g., "text-embedding-3-small").
 * @returns The dimension size or undefined if the model is not found.
 */
export declare function getModelDimension(provider: EmbedderProvider, modelId: string): number | undefined
/**
 * Retrieves the score threshold for a given provider and model ID.
 * @param provider The embedder provider (e.g., "openai").
 * @param modelId The specific model ID (e.g., "text-embedding-3-small").
 * @returns The score threshold or undefined if the model is not found.
 */
export declare function getModelScoreThreshold(provider: EmbedderProvider, modelId: string): number | undefined
/**
 * Retrieves the query prefix for a given provider and model ID.
 * @param provider The embedder provider (e.g., "openai").
 * @param modelId The specific model ID (e.g., "nomic-embed-code").
 * @returns The query prefix or undefined if the model doesn't require one.
 */
export declare function getModelQueryPrefix(provider: EmbedderProvider, modelId: string): string | undefined
/**
 * Gets the default *specific* embedding model ID based on the provider.
 * Does not include the provider prefix.
 * Currently defaults to OpenAI's 'text-embedding-3-small'.
 * TODO: Make this configurable or more sophisticated.
 * @param provider The embedder provider.
 * @returns The default specific model ID for the provider (e.g., "text-embedding-3-small").
 */
export declare function getDefaultModelId(provider: EmbedderProvider): string
//# sourceMappingURL=embeddingModels.d.ts.map
