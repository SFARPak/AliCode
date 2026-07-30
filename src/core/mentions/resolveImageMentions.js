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
Object.defineProperty(exports, "__esModule", { value: true })
exports.resolveImageMentions = resolveImageMentions
const path = __importStar(require("path"))
const context_mentions_1 = require("../../shared/context-mentions")
const imageHelpers_1 = require("../tools/helpers/imageHelpers")
const MAX_IMAGES_PER_MESSAGE = 20
function isPathWithinCwd(absPath, cwd) {
	const rel = path.relative(cwd, absPath)
	return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel)
}
function dedupePreserveOrder(values) {
	const seen = new Set()
	const result = []
	for (const v of values) {
		if (seen.has(v)) continue
		seen.add(v)
		result.push(v)
	}
	return result
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
async function resolveImageMentions({
	text,
	images,
	cwd,
	aliIgnoreController,
	supportsImages = true,
	maxImageFileSize = imageHelpers_1.DEFAULT_MAX_IMAGE_FILE_SIZE_MB,
	maxTotalImageSize = imageHelpers_1.DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB,
}) {
	const existingImages = Array.isArray(images) ? images : []
	if (existingImages.length >= MAX_IMAGES_PER_MESSAGE) {
		return { text, images: existingImages.slice(0, MAX_IMAGES_PER_MESSAGE) }
	}
	// If model doesn't support images, skip image processing entirely
	if (!supportsImages) {
		return { text, images: existingImages }
	}
	const mentions = Array.from(text.matchAll(context_mentions_1.mentionRegexGlobal))
		.map((m) => m[1])
		.filter(Boolean)
	if (mentions.length === 0) {
		return { text, images: existingImages }
	}
	const imageMentions = mentions.filter((mention) => {
		if (!mention.startsWith("/")) return false
		const relPath = (0, context_mentions_1.unescapeSpaces)(mention.slice(1))
		const ext = path.extname(relPath).toLowerCase()
		return (0, imageHelpers_1.isSupportedImageFormat)(ext)
	})
	if (imageMentions.length === 0) {
		return { text, images: existingImages }
	}
	const imageMemoryTracker = new imageHelpers_1.ImageMemoryTracker()
	const newImages = []
	for (const mention of imageMentions) {
		if (existingImages.length + newImages.length >= MAX_IMAGES_PER_MESSAGE) {
			break
		}
		const relPath = (0, context_mentions_1.unescapeSpaces)(mention.slice(1))
		const absPath = path.resolve(cwd, relPath)
		if (!isPathWithinCwd(absPath, cwd)) {
			continue
		}
		if (aliIgnoreController && !aliIgnoreController.validateAccess(relPath)) {
			continue
		}
		// Validate image size limits (matches read_file behavior)
		try {
			const validationResult = await (0, imageHelpers_1.validateImageForProcessing)(
				absPath,
				supportsImages,
				maxImageFileSize,
				maxTotalImageSize,
				imageMemoryTracker.getTotalMemoryUsed(),
			)
			if (!validationResult.isValid) {
				// Skip this image due to size/memory limits, but continue processing others
				continue
			}
			const { dataUrl } = await (0, imageHelpers_1.readImageAsDataUrlWithBuffer)(absPath)
			newImages.push(dataUrl)
			// Track memory usage
			if (validationResult.sizeInMB) {
				imageMemoryTracker.addMemoryUsage(validationResult.sizeInMB)
			}
		} catch {
			// Fail-soft: skip unreadable/missing files.
			continue
		}
	}
	const merged = dedupePreserveOrder([...existingImages, ...newImages]).slice(0, MAX_IMAGES_PER_MESSAGE)
	return { text, images: merged }
}
