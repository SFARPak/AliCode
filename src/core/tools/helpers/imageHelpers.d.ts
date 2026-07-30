/**
 * Default maximum allowed image file size in bytes (5MB)
 */
export declare const DEFAULT_MAX_IMAGE_FILE_SIZE_MB = 5
/**
 * Default maximum total memory usage for all images in a single read operation (20MB)
 * This is a cumulative limit - as each image is processed, its size is added to the total.
 * If including another image would exceed this limit, it will be skipped with a notice.
 * Example: With a 20MB limit, reading 3 images of 8MB, 7MB, and 10MB would process
 * the first two (15MB total) but skip the third to stay under the limit.
 */
export declare const DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB = 20
/**
 * Supported image formats that can be displayed
 */
export declare const SUPPORTED_IMAGE_FORMATS: readonly [
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".svg",
	".bmp",
	".ico",
	".tiff",
	".tif",
	".avif",
]
export declare const IMAGE_MIME_TYPES: Record<string, string>
/**
 * Result of image validation
 */
export interface ImageValidationResult {
	isValid: boolean
	reason?: "size_limit" | "memory_limit" | "unsupported_model"
	notice?: string
	sizeInMB?: number
}
/**
 * Result of image processing
 */
export interface ImageProcessingResult {
	dataUrl: string
	buffer: Buffer
	sizeInKB: number
	sizeInMB: number
	notice: string
}
/**
 * Reads an image file and returns both the data URL and buffer
 */
export declare function readImageAsDataUrlWithBuffer(filePath: string): Promise<{
	dataUrl: string
	buffer: Buffer
}>
/**
 * Checks if a file extension is a supported image format
 */
export declare function isSupportedImageFormat(extension: string): boolean
/**
 * Validates if an image can be processed based on size limits and model support
 */
export declare function validateImageForProcessing(
	fullPath: string,
	supportsImages: boolean,
	maxImageFileSize: number,
	maxTotalImageSize: number,
	currentTotalMemoryUsed: number,
): Promise<ImageValidationResult>
/**
 * Processes an image file and returns the result
 */
export declare function processImageFile(fullPath: string): Promise<ImageProcessingResult>
/**
 * Memory tracker for image processing
 */
export declare class ImageMemoryTracker {
	private totalMemoryUsed
	/**
	 * Gets the current total memory used in MB
	 */
	getTotalMemoryUsed(): number
	/**
	 * Adds to the total memory used
	 */
	addMemoryUsage(sizeInMB: number): void
	/**
	 * Resets the memory tracker
	 */
	reset(): void
}
//# sourceMappingURL=imageHelpers.d.ts.map
