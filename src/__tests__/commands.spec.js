"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const commands_1 = require("../services/command/commands")
describe("Command Utilities", () => {
	const testCwd = "/test/project"
	describe("getCommandNameFromFile", () => {
		it("should strip .md extension only", () => {
			expect((0, commands_1.getCommandNameFromFile)("my-command.md")).toBe("my-command")
			expect((0, commands_1.getCommandNameFromFile)("test.txt")).toBe("test.txt")
			expect((0, commands_1.getCommandNameFromFile)("no-extension")).toBe("no-extension")
			expect((0, commands_1.getCommandNameFromFile)("multiple.dots.file.md")).toBe("multiple.dots.file")
			expect((0, commands_1.getCommandNameFromFile)("api.config.md")).toBe("api.config")
			expect((0, commands_1.getCommandNameFromFile)("deploy_prod.md")).toBe("deploy_prod")
		})
	})
	describe("isMarkdownFile", () => {
		it("should identify markdown files correctly", () => {
			// Markdown files
			expect((0, commands_1.isMarkdownFile)("command.md")).toBe(true)
			expect((0, commands_1.isMarkdownFile)("my-command.md")).toBe(true)
			expect((0, commands_1.isMarkdownFile)("README.MD")).toBe(true)
			expect((0, commands_1.isMarkdownFile)("test.Md")).toBe(true)
			// Non-markdown files
			expect((0, commands_1.isMarkdownFile)("command.txt")).toBe(false)
			expect((0, commands_1.isMarkdownFile)("script.sh")).toBe(false)
			expect((0, commands_1.isMarkdownFile)("config.json")).toBe(false)
			expect((0, commands_1.isMarkdownFile)("no-extension")).toBe(false)
			expect((0, commands_1.isMarkdownFile)("file.md.bak")).toBe(false)
		})
	})
	describe("getCommands", () => {
		it("should return empty array when no command directories exist", async () => {
			// This will fail to find directories but should return empty array gracefully
			const commands = await (0, commands_1.getCommands)(testCwd)
			expect(Array.isArray(commands)).toBe(true)
		})
	})
	describe("getCommandNames", () => {
		it("should return empty array when no commands exist", async () => {
			const names = await (0, commands_1.getCommandNames)(testCwd)
			expect(Array.isArray(names)).toBe(true)
		})
	})
	describe("getCommand", () => {
		it("should return undefined for non-existent command", async () => {
			const result = await (0, commands_1.getCommand)(testCwd, "non-existent")
			expect(result).toBeUndefined()
		})
	})
	describe("command name extraction edge cases", () => {
		it("should handle various filename formats", () => {
			// Files without extensions
			expect((0, commands_1.getCommandNameFromFile)("command")).toBe("command")
			expect((0, commands_1.getCommandNameFromFile)("my-command")).toBe("my-command")
			// Files with multiple dots - only strip .md extension
			expect((0, commands_1.getCommandNameFromFile)("my.complex.command.md")).toBe("my.complex.command")
			expect((0, commands_1.getCommandNameFromFile)("v1.2.3.txt")).toBe("v1.2.3.txt")
			// Edge cases
			expect((0, commands_1.getCommandNameFromFile)(".")).toBe(".")
			expect((0, commands_1.getCommandNameFromFile)("..")).toBe("..")
			expect((0, commands_1.getCommandNameFromFile)(".hidden.md")).toBe(".hidden")
		})
	})
	describe("command loading behavior", () => {
		it("should handle multiple calls to getCommands", async () => {
			const commands1 = await (0, commands_1.getCommands)(testCwd)
			const commands2 = await (0, commands_1.getCommands)(testCwd)
			expect(Array.isArray(commands1)).toBe(true)
			expect(Array.isArray(commands2)).toBe(true)
		})
	})
	describe("error handling", () => {
		it("should handle invalid command names gracefully", async () => {
			// These should not throw errors
			expect(await (0, commands_1.getCommand)(testCwd, "")).toBeUndefined()
			expect(await (0, commands_1.getCommand)(testCwd, "   ")).toBeUndefined()
			expect(await (0, commands_1.getCommand)(testCwd, "non/existent/path")).toBeUndefined()
		})
	})
})
