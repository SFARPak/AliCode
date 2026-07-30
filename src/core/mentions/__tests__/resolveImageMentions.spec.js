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
const path = __importStar(require("path"))
const resolveImageMentions_1 = require("../resolveImageMentions")
vi.mock("../../tools/helpers/imageHelpers", () => ({
	isSupportedImageFormat: vi.fn((ext) =>
		[".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".ico", ".tiff", ".tif", ".avif"].includes(
			ext.toLowerCase(),
		),
	),
	readImageAsDataUrlWithBuffer: vi.fn(),
	validateImageForProcessing: vi.fn(),
	ImageMemoryTracker: vi.fn().mockImplementation(() => ({
		getTotalMemoryUsed: vi.fn().mockReturnValue(0),
		addMemoryUsage: vi.fn(),
	})),
	DEFAULT_MAX_IMAGE_FILE_SIZE_MB: 5,
	DEFAULT_MAX_TOTAL_IMAGE_SIZE_MB: 20,
}))
const imageHelpers_1 = require("../../tools/helpers/imageHelpers")
const mockReadImageAsDataUrl = vi.mocked(imageHelpers_1.readImageAsDataUrlWithBuffer)
const mockValidateImage = vi.mocked(imageHelpers_1.validateImageForProcessing)
describe("resolveImageMentions", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Default: validation passes
		mockValidateImage.mockResolvedValue({ isValid: true, sizeInMB: 0.1 })
	})
	it("should append a data URL when a local png mention is present", async () => {
		const dataUrl = `data:image/png;base64,${Buffer.from("png-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("png-bytes") })
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "Please look at @/assets/cat.png",
			images: [],
			cwd: "/workspace",
		})
		expect(mockValidateImage).toHaveBeenCalled()
		expect(mockReadImageAsDataUrl).toHaveBeenCalledWith(path.resolve("/workspace", "assets/cat.png"))
		expect(result.text).toBe("Please look at @/assets/cat.png")
		expect(result.images).toEqual([dataUrl])
	})
	it("should support gif images (matching read_file)", async () => {
		const dataUrl = `data:image/gif;base64,${Buffer.from("gif-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("gif-bytes") })
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/animation.gif",
			images: [],
			cwd: "/workspace",
		})
		expect(result.images).toEqual([dataUrl])
	})
	it("should support svg images (matching read_file)", async () => {
		const dataUrl = `data:image/svg+xml;base64,${Buffer.from("svg-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("svg-bytes") })
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/icon.svg",
			images: [],
			cwd: "/workspace",
		})
		expect(result.images).toEqual([dataUrl])
	})
	it("should ignore non-image mentions", async () => {
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/src/index.ts",
			images: [],
			cwd: "/workspace",
		})
		expect(mockReadImageAsDataUrl).not.toHaveBeenCalled()
		expect(result.images).toEqual([])
	})
	it("should skip unreadable files (fail-soft)", async () => {
		mockReadImageAsDataUrl.mockRejectedValue(new Error("ENOENT"))
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/missing.webp",
			images: [],
			cwd: "/workspace",
		})
		expect(result.images).toEqual([])
	})
	it("should respect aliIgnoreController", async () => {
		const dataUrl = `data:image/jpeg;base64,${Buffer.from("jpg-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("jpg-bytes") })
		const aliIgnoreController = {
			validateAccess: vi.fn().mockReturnValue(false),
		}
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/secret.jpg",
			images: [],
			cwd: "/workspace",
			aliIgnoreController,
		})
		expect(aliIgnoreController.validateAccess).toHaveBeenCalledWith("secret.jpg")
		expect(mockReadImageAsDataUrl).not.toHaveBeenCalled()
		expect(result.images).toEqual([])
	})
	it("should dedupe when mention repeats", async () => {
		const dataUrl = `data:image/png;base64,${Buffer.from("png-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("png-bytes") })
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "@/a.png and again @/a.png",
			images: [],
			cwd: "/workspace",
		})
		expect(result.images).toHaveLength(1)
	})
	it("should skip images when supportsImages is false", async () => {
		const dataUrl = `data:image/png;base64,${Buffer.from("png-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("png-bytes") })
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/cat.png",
			images: [],
			cwd: "/workspace",
			supportsImages: false,
		})
		expect(mockReadImageAsDataUrl).not.toHaveBeenCalled()
		expect(result.images).toEqual([])
	})
	it("should skip images that exceed size limits", async () => {
		mockValidateImage.mockResolvedValue({
			isValid: false,
			reason: "size_limit",
			notice: "Image too large",
		})
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/huge.png",
			images: [],
			cwd: "/workspace",
		})
		expect(mockValidateImage).toHaveBeenCalled()
		expect(mockReadImageAsDataUrl).not.toHaveBeenCalled()
		expect(result.images).toEqual([])
	})
	it("should skip images that would exceed memory limit", async () => {
		mockValidateImage.mockResolvedValue({
			isValid: false,
			reason: "memory_limit",
			notice: "Would exceed memory limit",
		})
		const result = await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/large.png",
			images: [],
			cwd: "/workspace",
		})
		expect(result.images).toEqual([])
	})
	it("should pass custom size limits to validation", async () => {
		const dataUrl = `data:image/png;base64,${Buffer.from("png-bytes").toString("base64")}`
		mockReadImageAsDataUrl.mockResolvedValue({ dataUrl, buffer: Buffer.from("png-bytes") })
		await (0, resolveImageMentions_1.resolveImageMentions)({
			text: "See @/cat.png",
			images: [],
			cwd: "/workspace",
			maxImageFileSize: 10,
			maxTotalImageSize: 50,
		})
		expect(mockValidateImage).toHaveBeenCalledWith(expect.any(String), true, 10, 50, 0)
	})
})
