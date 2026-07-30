export interface ResolveImageMentionsOptions {
	text: string
	images?: string[]
	cwd: string
	aliIgnoreController?: {
		validateAccess: (filePath: string) => boolean
	}
	/** Whether the current model supports images. Defaults to true. */
	supportsImages?: boolean
	/** Maximum size per image file in MB. Defaults to 5MB. */
	maxImageFileSize?: number
	/** Maximum total size of all images in MB. Defaults to 20MB. */
	maxTotalImageSize?: number
}
export interface ResolveImageMentionsResult {
	text: string
	images: string[]
}
/**
 * Resolves local image file mentions like `@/path/to/image.png` found in `text` into `data:image/...;base64,...`
 * and appends them to the outgoing `images` array.
 *
 * Behavior matches the read_file tool:
 * - Supports the same image formats: png, jpg, jpeg, gif, webp, svg, bmp, ico, tiff, avif
 * - Respects per-file size limits (default 5MB)
 * - Respects total memory limits (default 20MB)
 * - Skips images if model doesn't support them
 * - Respects `.aliignore` via `aliIgnoreController.validateAccess` when provided
 */
export declare function resolveImageMentions({
	text,
	images,
	cwd,
	aliIgnoreController,
	supportsImages,
	maxImageFileSize,
	maxTotalImageSize,
}: ResolveImageMentionsOptions): Promise<ResolveImageMentionsResult>
//# sourceMappingURL=resolveImageMentions.d.ts.map
