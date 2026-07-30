import type { ProviderName, ModelRecord } from "@ali-code/types"
import { GetModelsOptions } from "../../../shared/api"
/**
 * Get models from the cache or fetch them from the provider and cache them.
 * There are two caches:
 * 1. Memory cache - This is a simple in-memory cache that is used to store models for a short period of time.
 * 2. File cache - This is a file-based cache that is used to store models for a longer period of time.
 *
 * @param router - The router to fetch models from.
 * @param apiKey - Optional API key for the provider.
 * @param baseUrl - Optional base URL for the provider (currently used only for LiteLLM).
 * @returns The models from the cache or the fetched models.
 */
export declare const getModels: (options: GetModelsOptions) => Promise<ModelRecord>
/**
 * Force-refresh models from API, bypassing cache.
 * Uses atomic writes so cache remains available during refresh.
 * This function also prevents concurrent API calls for the same provider using
 * in-flight request tracking to avoid race conditions.
 *
 * @param options - Provider options for fetching models
 * @returns Fresh models from API, or existing cache if refresh yields worse data
 */
export declare const refreshModels: (options: GetModelsOptions) => Promise<ModelRecord>
/**
 * Initialize background model cache refresh.
 * Refreshes public provider caches without blocking or requiring auth.
 * Should be called once during extension activation.
 */
export declare function initializeModelCacheRefresh(): Promise<void>
/**
 * Flush models memory cache for a specific router.
 *
 * @param options - The options for fetching models, including provider, apiKey, and baseUrl
 * @param refresh - If true, immediately fetch fresh data from API
 */
export declare const flushModels: (options: GetModelsOptions, refresh?: boolean) => Promise<void>
/**
 * Get models from cache, checking memory first, then disk.
 * This ensures providers always have access to last known good data,
 * preventing fallback to hardcoded defaults on startup.
 *
 * @param provider - The provider to get models for.
 * @returns Models from memory cache, disk cache, or undefined if not cached.
 */
export declare function getModelsFromCache(provider: ProviderName): ModelRecord | undefined
//# sourceMappingURL=modelCache.d.ts.map
