export interface ImageGenerationResult {
	success: boolean
	imageData?: string
	imageFormat?: string
	error?: string
}
interface ImageGenerationOptions {
	baseURL: string
	authToken: string
	model: string
	prompt: string
	inputImage?: string
}
interface ImagesApiOptions {
	baseURL: string
	authToken: string
	model: string
	prompt: string
	inputImage?: string
	size?: string
	quality?: string
	outputFormat?: string
}
/**
 * Shared image generation implementation for OpenAI-compatible image providers.
 */
export declare function generateImageWithProvider(options: ImageGenerationOptions): Promise<ImageGenerationResult>
/**
 * Generate an image using OpenAI's Images API (/v1/images/generations)
 * Supports BFL models (Flux) with provider-specific options for image editing
 */
export declare function generateImageWithImagesApi(options: ImagesApiOptions): Promise<ImageGenerationResult>
export {}
//# sourceMappingURL=image-generation.d.ts.map
