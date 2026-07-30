"use strict"
// npx vitest run api/providers/utils/__tests__/timeout-config.spec.ts
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
const timeout_config_1 = require("../timeout-config")
const vscode = __importStar(require("vscode"))
// Mock vscode
vitest.mock("vscode", () => ({
	workspace: {
		getConfiguration: vitest.fn().mockReturnValue({
			get: vitest.fn(),
		}),
	},
}))
describe("getApiRequestTimeout", () => {
	let mockGetConfig
	beforeEach(() => {
		vitest.clearAllMocks()
		mockGetConfig = vitest.fn()
		vscode.workspace.getConfiguration.mockReturnValue({
			get: mockGetConfig,
		})
	})
	it("should return default timeout of 600000ms when no configuration is set", () => {
		mockGetConfig.mockReturnValue(600)
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("alicode")
		expect(mockGetConfig).toHaveBeenCalledWith("apiRequestTimeout", 600)
		expect(timeout).toBe(600000) // 600 seconds in milliseconds
	})
	it("should return custom timeout in milliseconds", () => {
		mockGetConfig.mockReturnValue(1200) // 20 minutes
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(timeout).toBe(1200000) // 1200 seconds in milliseconds
	})
	it("should return undefined for zero timeout (disables timeout)", () => {
		mockGetConfig.mockReturnValue(0)
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		// Zero means "no timeout" - return undefined so SDK uses its default
		// (OpenAI SDK interprets 0 as "abort immediately", so we avoid that)
		expect(timeout).toBeUndefined()
	})
	it("should return undefined for negative values (disables timeout)", () => {
		mockGetConfig.mockReturnValue(-100)
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		// Negative values also mean "no timeout" - return undefined
		expect(timeout).toBeUndefined()
	})
	it("should handle null by using default", () => {
		mockGetConfig.mockReturnValue(null)
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(timeout).toBe(600000) // Should fall back to default 600 seconds
	})
	it("should handle undefined by using default", () => {
		mockGetConfig.mockReturnValue(undefined)
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(timeout).toBe(600000) // Should fall back to default 600 seconds
	})
	it("should handle NaN by using default", () => {
		mockGetConfig.mockReturnValue(NaN)
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(timeout).toBe(600000) // Should fall back to default 600 seconds
	})
	it("should handle string values by using default", () => {
		mockGetConfig.mockReturnValue("not-a-number") // String instead of number
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(timeout).toBe(600000) // Should fall back to default since it's not a number
	})
	it("should handle boolean values by using default", () => {
		mockGetConfig.mockReturnValue(true) // Boolean instead of number
		const timeout = (0, timeout_config_1.getApiRequestTimeout)()
		expect(timeout).toBe(600000) // Should fall back to default since it's not a number
	})
})
