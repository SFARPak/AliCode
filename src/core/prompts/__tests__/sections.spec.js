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
const custom_instructions_1 = require("../sections/custom-instructions")
const capabilities_1 = require("../sections/capabilities")
const rules_1 = require("../sections/rules")
const shellUtils = __importStar(require("../../../utils/shell"))
describe("addCustomInstructions", () => {
	it("adds vscode language to custom instructions", async () => {
		const result = await (0, custom_instructions_1.addCustomInstructions)(
			"mode instructions",
			"global instructions",
			"/test/path",
			"test-mode",
			{ language: "fr" },
		)
		expect(result).toContain("Language Preference:")
		expect(result).toContain('You should always speak and think in the "Français" (fr) language')
	})
	it("works without vscode language", async () => {
		const result = await (0, custom_instructions_1.addCustomInstructions)(
			"mode instructions",
			"global instructions",
			"/test/path",
			"test-mode",
		)
		expect(result).not.toContain("Language Preference:")
		expect(result).not.toContain("You should always speak and think in")
	})
})
describe("getCapabilitiesSection", () => {
	const cwd = "/test/path"
	it("includes standard capabilities", () => {
		const result = (0, capabilities_1.getCapabilitiesSection)(cwd)
		expect(result).toContain("CAPABILITIES")
		expect(result).toContain("execute CLI commands")
		expect(result).toContain("list files")
		expect(result).toContain("read and write files")
	})
	it("includes MCP reference when mcpHub is provided", () => {
		const mockMcpHub = {}
		const result = (0, capabilities_1.getCapabilitiesSection)(cwd, mockMcpHub)
		expect(result).toContain("MCP servers")
	})
	it("excludes MCP reference when mcpHub is undefined", () => {
		const result = (0, capabilities_1.getCapabilitiesSection)(cwd, undefined)
		expect(result).not.toContain("MCP servers")
	})
})
describe("getRulesSection", () => {
	const cwd = "/test/path"
	it("includes standard rules", () => {
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).toContain("RULES")
		expect(result).toContain("project base directory")
		expect(result).toContain(cwd)
	})
	it("includes vendor confidentiality section when isStealthModel is true", () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
			isStealthModel: true,
		}
		const result = (0, rules_1.getRulesSection)(cwd, settings)
		expect(result).toContain("VENDOR CONFIDENTIALITY")
		expect(result).toContain("Never reveal the vendor or company that created you")
		expect(result).toContain("I was created by a team of developers")
		expect(result).not.toContain("I'm an open-source project maintained by contributors")
		expect(result).toContain("I don't have information about specific vendors")
	})
	it("excludes vendor confidentiality section when isStealthModel is false", () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
			isStealthModel: false,
		}
		const result = (0, rules_1.getRulesSection)(cwd, settings)
		expect(result).not.toContain("VENDOR CONFIDENTIALITY")
		expect(result).not.toContain("Never reveal the vendor or company")
	})
	it("excludes vendor confidentiality section when isStealthModel is undefined", () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
		}
		const result = (0, rules_1.getRulesSection)(cwd, settings)
		expect(result).not.toContain("VENDOR CONFIDENTIALITY")
		expect(result).not.toContain("Never reveal the vendor or company")
	})
})
describe("getCommandChainOperator", () => {
	it("returns && for bash shell", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("/bin/bash")
		expect((0, rules_1.getCommandChainOperator)()).toBe("&&")
	})
	it("returns && for zsh shell", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("/bin/zsh")
		expect((0, rules_1.getCommandChainOperator)()).toBe("&&")
	})
	it("returns ; for PowerShell", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue(
			"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
		)
		expect((0, rules_1.getCommandChainOperator)()).toBe(";")
	})
	it("returns ; for PowerShell Core (pwsh)", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("C:\\Program Files\\PowerShell\\7\\pwsh.exe")
		expect((0, rules_1.getCommandChainOperator)()).toBe(";")
	})
	it("returns && for cmd.exe", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("C:\\Windows\\System32\\cmd.exe")
		expect((0, rules_1.getCommandChainOperator)()).toBe("&&")
	})
	it("returns && for Git Bash on Windows", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("C:\\Program Files\\Git\\bin\\bash.exe")
		expect((0, rules_1.getCommandChainOperator)()).toBe("&&")
	})
	it("returns && for WSL bash", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("/bin/bash")
		expect((0, rules_1.getCommandChainOperator)()).toBe("&&")
	})
})
describe("getRulesSection shell-aware command chaining", () => {
	const cwd = "/test/path"
	afterEach(() => {
		vi.restoreAllMocks()
	})
	it("uses && for Unix shells in command chaining example", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("/bin/bash")
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).toContain("cd (path to project) && (command")
		expect(result).not.toContain("cd (path to project) ; (command")
		expect(result).not.toContain("cd (path to project) & (command")
	})
	it("uses ; for PowerShell in command chaining example", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue(
			"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
		)
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).toContain("cd (path to project) ; (command")
		expect(result).toContain("Note: Using `;` for PowerShell command chaining")
	})
	it("uses && for cmd.exe in command chaining example", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("C:\\Windows\\System32\\cmd.exe")
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).toContain("cd (path to project) && (command")
		expect(result).toContain("Note: Using `&&` for cmd.exe command chaining")
	})
	it("includes Unix utility guidance for PowerShell", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue(
			"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
		)
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).toContain("IMPORTANT: When using PowerShell, avoid Unix-specific utilities")
		expect(result).toContain("`sed`, `grep`, `awk`, `cat`, `rm`, `cp`, `mv`")
		expect(result).toContain("`Select-String` for grep")
		expect(result).toContain("`Get-Content` for cat")
		expect(result).toContain("PowerShell's `-replace` operator")
	})
	it("includes Unix utility guidance for cmd.exe", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("C:\\Windows\\System32\\cmd.exe")
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).toContain("IMPORTANT: When using cmd.exe, avoid Unix-specific utilities")
		expect(result).toContain("`sed`, `grep`, `awk`, `cat`, `rm`, `cp`, `mv`")
		expect(result).toContain("`type` for cat")
		expect(result).toContain("`del` for rm")
		expect(result).toContain("`find`/`findstr` for grep")
	})
	it("does not include Unix utility guidance for Unix shells", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("/bin/bash")
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).not.toContain("IMPORTANT: When using PowerShell")
		expect(result).not.toContain("IMPORTANT: When using cmd.exe")
		expect(result).not.toContain("`Select-String` for grep")
	})
	it("does not include note for Unix shells", () => {
		vi.spyOn(shellUtils, "getShell").mockReturnValue("/bin/zsh")
		const result = (0, rules_1.getRulesSection)(cwd)
		expect(result).not.toContain("Note: Using")
	})
})
