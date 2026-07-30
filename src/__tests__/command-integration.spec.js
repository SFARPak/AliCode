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
const commands_1 = require("../services/command/commands")
describe("Command Integration Tests", () => {
	const testWorkspaceDir = path.join(__dirname, "../../")
	it("should discover command files in .ali/commands/", async () => {
		const commands = await (0, commands_1.getCommands)(testWorkspaceDir)
		// Should be able to discover commands (may be empty in test environment)
		expect(Array.isArray(commands)).toBe(true)
		// If commands exist, verify they have valid properties
		commands.forEach((command) => {
			expect(command.name).toBeDefined()
			expect(typeof command.name).toBe("string")
			expect(command.source).toMatch(/^(project|global|built-in)$/)
			expect(command.content).toBeDefined()
			expect(typeof command.content).toBe("string")
		})
	})
	it("should return command names correctly", async () => {
		const commandNames = await (0, commands_1.getCommandNames)(testWorkspaceDir)
		// Should return an array (may be empty in test environment)
		expect(Array.isArray(commandNames)).toBe(true)
		// If command names exist, they should be strings
		commandNames.forEach((name) => {
			expect(typeof name).toBe("string")
			expect(name.length).toBeGreaterThan(0)
		})
	})
	it("should load command content if commands exist", async () => {
		const commands = await (0, commands_1.getCommands)(testWorkspaceDir)
		if (commands.length > 0) {
			const firstCommand = commands[0]
			const loadedCommand = await (0, commands_1.getCommand)(testWorkspaceDir, firstCommand.name)
			expect(loadedCommand).toBeDefined()
			expect(loadedCommand?.name).toBe(firstCommand.name)
			expect(loadedCommand?.source).toMatch(/^(project|global|built-in)$/)
			expect(loadedCommand?.content).toBeDefined()
			expect(typeof loadedCommand?.content).toBe("string")
		}
	})
	it("should handle non-existent commands gracefully", async () => {
		const nonExistentCommand = await (0, commands_1.getCommand)(testWorkspaceDir, "non-existent-command")
		expect(nonExistentCommand).toBeUndefined()
	})
})
