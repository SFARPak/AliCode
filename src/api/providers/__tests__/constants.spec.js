"use strict"
// npx vitest run src/api/providers/__tests__/constants.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const constants_1 = require("../constants")
const package_1 = require("../../../shared/package")
describe("DEFAULT_HEADERS", () => {
	it("should contain all required headers", () => {
		expect(constants_1.DEFAULT_HEADERS).toHaveProperty("HTTP-Referer")
		expect(constants_1.DEFAULT_HEADERS).toHaveProperty("X-Title")
		expect(constants_1.DEFAULT_HEADERS).toHaveProperty("User-Agent")
	})
	it("should have correct HTTP-Referer value", () => {
		expect(constants_1.DEFAULT_HEADERS["HTTP-Referer"]).toBe("https://github.com/AliCodeInc/Ali-Code")
	})
	it("should have correct X-Title value", () => {
		expect(constants_1.DEFAULT_HEADERS["X-Title"]).toBe("AliCode")
	})
	it("should have correct User-Agent format", () => {
		const userAgent = constants_1.DEFAULT_HEADERS["User-Agent"]
		expect(userAgent).toBe(`AliCode/${package_1.Package.version}`)
		// Verify it follows the tool_name/version pattern
		expect(userAgent).toMatch(/^[a-zA-Z-]+\/\d+\.\d+\.\d+$/)
	})
	it("should have User-Agent with correct tool name", () => {
		const userAgent = constants_1.DEFAULT_HEADERS["User-Agent"]
		expect(userAgent.startsWith("AliCode/")).toBe(true)
	})
	it("should have User-Agent with semantic version format", () => {
		const userAgent = constants_1.DEFAULT_HEADERS["User-Agent"]
		const version = userAgent.split("/")[1]
		// Check semantic version format (major.minor.patch)
		expect(version).toMatch(/^\d+\.\d+\.\d+$/)
		// Verify current version matches package version
		expect(version).toBe(package_1.Package.version)
	})
	it("should be an object with string values", () => {
		expect(typeof constants_1.DEFAULT_HEADERS).toBe("object")
		expect(constants_1.DEFAULT_HEADERS).not.toBeNull()
		Object.values(constants_1.DEFAULT_HEADERS).forEach((value) => {
			expect(typeof value).toBe("string")
			expect(value.length).toBeGreaterThan(0)
		})
	})
	it("should have exactly 3 headers", () => {
		const headerKeys = Object.keys(constants_1.DEFAULT_HEADERS)
		expect(headerKeys).toHaveLength(3)
		expect(headerKeys).toEqual(["HTTP-Referer", "X-Title", "User-Agent"])
	})
})
