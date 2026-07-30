/**
 * Image generation model constants
 */
/**
 * API method used for image generation
 */
export type ImageGenerationApiMethod = "chat_completions" | "images_api"
export interface ImageGenerationModel {
	value: string
	label: string
	provider: ImageGenerationProvider
	apiMethod?: ImageGenerationApiMethod
}
export declare const IMAGE_GENERATION_MODELS: ImageGenerationModel[]
/**
 * Get array of model values only (for backend validation)
 */
export declare const IMAGE_GENERATION_MODEL_IDS: string[]
/**
 * Image generation provider type
 */
export type ImageGenerationProvider = "openrouter"
/**
 * Get the image generation provider with backwards compatibility
 * - If provider is explicitly set, use it
 * - If a model is already configured (existing users), default to "openrouter"
 * - Otherwise default to "openrouter" (new users)
 */
export declare function getImageGenerationProvider(
	explicitProvider: ImageGenerationProvider | undefined,
	_hasExistingModel: boolean,
): ImageGenerationProvider
//# sourceMappingURL=image-generation.d.ts.map
