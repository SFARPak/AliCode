/**
 * ImageProcessingService - stub implementation
 */
export class ImageProcessingService {
	async process(_input: Buffer): Promise<Buffer> {
		return _input
	}
}

export const imageProcessingService = new ImageProcessingService()
