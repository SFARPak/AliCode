"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.ImageMemoryTracker =
	exports.IMAGE_MIME_TYPES =
	exports.SUPPORTED_IMAGE_FORMATS =
	exports.DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB =
	exports.DEFAULT_MAX_IMAGE_FILE_SIZE_MB =
		void 0
exports.readImageAsDataUrlWithBuffer = readImageAsDataUrlWithBuffer
exports.isSupportedImageFormat = isSupportedImageFormat
exports.validateImageForProcessing = validateImageForProcessing
exports.processImageFile = processImageFile
const path_1 = __importDefault(require("path"))
const fs = __importStar(require("fs/promises"))
const i18n_1 = require("../../../i18n")
const pretty_bytes_1 = __importDefault(require("pretty-bytes"))
/**
 * Default maximum allowed image file size in bytes (5MB)
 */
exports.DEFAULT_MAX_IMAGE_FILE_SIZE_MB = 5
/**
 * Default maximum total memory usage for all images in a single read operation (20MB)
 * This is a cumulative limit - as each image is processed, its size is added to the total.
 * If including another image would exceed this limit, it will be skipped with a notice.
 * Example: With a 20MB limit, reading 3 images of 8MB, 7MB, and 10MB would process
 * the first two (15MB total) but skip the third to stay under the limit.
 */
exports.DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB = 20
/**
 * Supported image formats that can be displayed
 */
exports.SUPPORTED_IMAGE_FORMATS = [
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
exports.IMAGE_MIME_TYPES = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".svg": "image/svg+xml",
	".bmp": "image/bmp",
	".ico": "image/x-icon",
	".tiff": "image/tiff",
	".tif": "image/tiff",
	".avif": "image/avif",
}
/**
 * Reads an image file and returns both the data URL and buffer
 */
async function readImageAsDataUrlWithBuffer(filePath) {
	const fileBuffer = await fs.readFile(filePath)
	const base64 = fileBuffer.toString("base64")
	const ext = path_1.default.extname(filePath).toLowerCase()
	const mimeType = exports.IMAGE_MIME_TYPES[ext] || "image/png"
	const dataUrl = `data:${mimeType};base64,${base64}`
	return { dataUrl, buffer: fileBuffer }
}
/**
 * Checks if a file extension is a supported image format
 */
function isSupportedImageFormat(extension) {
	return exports.SUPPORTED_IMAGE_FORMATS.includes(extension.toLowerCase())
}
/**
 * Validates if an image can be processed based on size limits and model support
 */
async function validateImageForProcessing(
	fullPath,
	supportsImages,
	maxImageFileSize,
	maxTotalImageSize,
	currentTotalMemoryUsed,
) {
	// Check if model supports images
	if (!supportsImages) {
		return {
			isValid: false,
			reason: "unsupported_model",
			notice: "Image file detected but current model does not support images. Skipping image processing.",
		}
	}
	const imageStats = await fs.stat(fullPath)
	const imageSizeInMB = imageStats.size / (1024 * 1024)
	// Check individual file size limit
	if (imageStats.size > maxImageFileSize * 1024 * 1024) {
		const imageSizeFormatted = (0, pretty_bytes_1.default)(imageStats.size)
		return {
			isValid: false,
			reason: "size_limit",
			notice: (0, i18n_1.t)("tools:readFile.imageTooLarge", {
				size: imageSizeFormatted,
				max: maxImageFileSize,
			}),
			sizeInMB: imageSizeInMB,
		}
	}
	// Check total memory limit
	if (currentTotalMemoryUsed + imageSizeInMB > maxTotalImageSize) {
		const currentMemoryFormatted = (0, pretty_bytes_1.default)(currentTotalMemoryUsed * 1024 * 1024)
		const fileMemoryFormatted = (0, pretty_bytes_1.default)(imageStats.size)
		return {
			isValid: false,
			reason: "memory_limit",
			notice: `Image skipped to avoid size limit (${maxTotalImageSize}MB). Current: ${currentMemoryFormatted} + this file: ${fileMemoryFormatted}. Try fewer or smaller images.`,
			sizeInMB: imageSizeInMB,
		}
	}
	return {
		isValid: true,
		sizeInMB: imageSizeInMB,
	}
}
/**
 * Processes an image file and returns the result
 */
async function processImageFile(fullPath) {
	const imageStats = await fs.stat(fullPath)
	const { dataUrl, buffer } = await readImageAsDataUrlWithBuffer(fullPath)
	const imageSizeInKB = Math.round(imageStats.size / 1024)
	const imageSizeInMB = imageStats.size / (1024 * 1024)
	const noticeText = (0, i18n_1.t)("tools:readFile.imageWithSize", { size: imageSizeInKB })
	return {
		dataUrl,
		buffer,
		sizeInKB: imageSizeInKB,
		sizeInMB: imageSizeInMB,
		notice: noticeText,
	}
}
/**
 * Memory tracker for image processing
 */
class ImageMemoryTracker {
	totalMemoryUsed = 0
	/**
	 * Gets the current total memory used in MB
	 */
	getTotalMemoryUsed() {
		return this.totalMemoryUsed
	}
	/**
	 * Adds to the total memory used
	 */
	addMemoryUsage(sizeInMB) {
		this.totalMemoryUsed += sizeInMB
	}
	/**
	 * Resets the memory tracker
	 */
	reset() {
		this.totalMemoryUsed = 0
	}
}
exports.ImageMemoryTracker = ImageMemoryTracker
