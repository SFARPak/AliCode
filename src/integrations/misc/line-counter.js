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
exports.countFileLines = countFileLines
exports.countFileLinesAndTokens = countFileLinesAndTokens
const fs = __importStar(require("fs"))
const readline_1 = require("readline")
const countTokens_1 = require("../../utils/countTokens")
/**
 * Efficiently counts lines in a file using streams without loading the entire file into memory
 *
 * @param filePath - Path to the file to count lines in
 * @returns A promise that resolves to the number of lines in the file
 */
async function countFileLines(filePath) {
	// Check if file exists
	try {
		await fs.default.promises.access(filePath, fs.default.constants.F_OK)
	} catch (error) {
		throw new Error(`File not found: ${filePath}`)
	}
	return new Promise((resolve, reject) => {
		let lineCount = 0
		const readStream = fs.createReadStream(filePath)
		const rl = (0, readline_1.createInterface)({
			input: readStream,
			crlfDelay: Infinity,
		})
		rl.on("line", () => {
			lineCount++
		})
		rl.on("close", () => {
			resolve(lineCount)
		})
		rl.on("error", (err) => {
			reject(err)
		})
		readStream.on("error", (err) => {
			reject(err)
		})
	})
}
/**
 * Efficiently counts lines and estimates tokens in a file using streams with incremental token estimation.
 * Processes file in chunks to avoid memory issues and can early-exit when budget is exceeded.
 *
 * @param filePath - Path to the file to analyze
 * @param options - Configuration options for counting
 * @returns A promise that resolves to line count, token estimate, and completion status
 */
async function countFileLinesAndTokens(filePath, options = {}) {
	const { budgetTokens, chunkLines = 256 } = options
	// Check if file exists
	try {
		await fs.default.promises.access(filePath, fs.default.constants.F_OK)
	} catch (error) {
		throw new Error(`File not found: ${filePath}`)
	}
	return new Promise((resolve, reject) => {
		let lineCount = 0
		let tokenEstimate = 0
		let lineBuffer = []
		let complete = true
		let isProcessing = false
		let shouldClose = false
		const readStream = fs.createReadStream(filePath)
		const rl = (0, readline_1.createInterface)({
			input: readStream,
			crlfDelay: Infinity,
		})
		const processBuffer = async () => {
			if (lineBuffer.length === 0) return
			const bufferText = lineBuffer.join("\n")
			lineBuffer = [] // Clear buffer before processing
			try {
				const contentBlocks = [{ type: "text", text: bufferText }]
				const chunkTokens = await (0, countTokens_1.countTokens)(contentBlocks)
				tokenEstimate += chunkTokens
			} catch (error) {
				// On tokenizer error, use conservative estimate: 2 char ≈ 1 token
				tokenEstimate += Math.ceil(bufferText.length / 2)
			}
			// Check if we've exceeded budget
			if (budgetTokens !== undefined && tokenEstimate > budgetTokens) {
				complete = false
				shouldClose = true
				rl.close()
				readStream.destroy()
			}
		}
		rl.on("line", (line) => {
			lineCount++
			lineBuffer.push(line)
			// Process buffer when it reaches chunk size
			if (lineBuffer.length >= chunkLines && !isProcessing) {
				isProcessing = true
				rl.pause()
				processBuffer()
					.then(() => {
						isProcessing = false
						if (!shouldClose) {
							rl.resume()
						}
					})
					.catch((err) => {
						isProcessing = false
						reject(err)
					})
			}
		})
		rl.on("close", async () => {
			// Wait for any ongoing processing to complete
			while (isProcessing) {
				await new Promise((r) => setTimeout(r, 10))
			}
			// Process any remaining lines in buffer
			try {
				await processBuffer()
				resolve({ lineCount, tokenEstimate, complete })
			} catch (err) {
				reject(err)
			}
		})
		rl.on("error", (err) => {
			reject(err)
		})
		readStream.on("error", (err) => {
			reject(err)
		})
	})
}
