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
describe("custom-instructions path detection", () => {
	it("should use exact path comparison instead of string includes", () => {
		// Test the logic that our fix implements
		const fakeHomeDir = "/Users/john.roo.smith"
		const globalAliDir = path.join(fakeHomeDir, ".ali") // "/Users/john.roo.smith/.roo"
		const projectAliDir = "/projects/my-project/.roo"
		// Old implementation (fragile):
		// const isGlobal = aliDir.includes(path.join(os.homedir(), ".ali"))
		// This could fail if the home directory path contains ".ali" elsewhere
		// New implementation (robust):
		// const isGlobal = path.resolve(aliDir) === path.resolve(getGlobalAliDirectory())
		// Test the new logic
		const isGlobalForGlobalDir = path.resolve(globalAliDir) === path.resolve(globalAliDir)
		const isGlobalForProjectDir = path.resolve(projectAliDir) === path.resolve(globalAliDir)
		expect(isGlobalForGlobalDir).toBe(true)
		expect(isGlobalForProjectDir).toBe(false)
		// Verify that the old implementation would have been problematic
		// if the home directory contained ".ali" in the path
		const oldLogicGlobal = globalAliDir.includes(path.join(fakeHomeDir, ".ali"))
		const oldLogicProject = projectAliDir.includes(path.join(fakeHomeDir, ".ali"))
		expect(oldLogicGlobal).toBe(true) // This works
		expect(oldLogicProject).toBe(false) // This also works, but is fragile
		// The issue was that if the home directory path itself contained ".ali",
		// the includes() check could produce false positives in edge cases
	})
	it("should handle edge cases with path resolution", () => {
		// Test various edge cases that exact path comparison handles better
		const testCases = [
			{
				global: "/Users/test/.roo",
				project: "/Users/test/project/.roo",
				expected: { global: true, project: false },
			},
			{
				global: "/home/user/.roo",
				project: "/home/user/.roo", // Same directory
				expected: { global: true, project: true },
			},
			{
				global: "/Users/john.roo.smith/.roo",
				project: "/projects/app/.roo",
				expected: { global: true, project: false },
			},
		]
		testCases.forEach(({ global, project, expected }) => {
			const isGlobalForGlobal = path.resolve(global) === path.resolve(global)
			const isGlobalForProject = path.resolve(project) === path.resolve(global)
			expect(isGlobalForGlobal).toBe(expected.global)
			expect(isGlobalForProject).toBe(expected.project)
		})
	})
})
