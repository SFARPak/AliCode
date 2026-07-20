import path from "path"
import { AliProtectedController } from "../AliProtectedController"

describe("AliProtectedController", () => {
	const TEST_CWD = "/test/workspace"
	let controller: AliProtectedController

	beforeEach(() => {
		controller = new AliProtectedController(TEST_CWD)
	})

	describe("isWriteProtected", () => {
		it("should protect .aliignore file", () => {
			expect(controller.isWriteProtected(".aliignore")).toBe(true)
		})

		it("should protect files in .roo directory", () => {
			expect(controller.isWriteProtected(".ali/config.json")).toBe(true)
			expect(controller.isWriteProtected(".ali/settings/user.json")).toBe(true)
			expect(controller.isWriteProtected(".ali/modes/custom.json")).toBe(true)
		})

		it("should protect .aliprotected file", () => {
			expect(controller.isWriteProtected(".aliprotected")).toBe(true)
		})

		it("should protect .alimodes files", () => {
			expect(controller.isWriteProtected(".alimodes")).toBe(true)
		})

		it("should protect .alirules* files", () => {
			expect(controller.isWriteProtected(".alirules")).toBe(true)
			expect(controller.isWriteProtected(".alirules.md")).toBe(true)
		})

		it("should protect .clinerules* files", () => {
			expect(controller.isWriteProtected(".clinerules")).toBe(true)
			expect(controller.isWriteProtected(".clinerules.md")).toBe(true)
		})

		it("should protect files in .vscode directory", () => {
			expect(controller.isWriteProtected(".vscode/settings.json")).toBe(true)
			expect(controller.isWriteProtected(".vscode/launch.json")).toBe(true)
			expect(controller.isWriteProtected(".vscode/tasks.json")).toBe(true)
		})

		it("should protect .code-workspace files", () => {
			expect(controller.isWriteProtected("myproject.code-workspace")).toBe(true)
			expect(controller.isWriteProtected("pentest.code-workspace")).toBe(true)
			expect(controller.isWriteProtected(".code-workspace")).toBe(true)
			expect(controller.isWriteProtected("folder/workspace.code-workspace")).toBe(true)
		})

		it("should protect AGENTS.md file", () => {
			expect(controller.isWriteProtected("AGENTS.md")).toBe(true)
		})

		it("should protect AGENT.md file", () => {
			expect(controller.isWriteProtected("AGENT.md")).toBe(true)
		})

		it("should not protect other files starting with .roo", () => {
			expect(controller.isWriteProtected(".roosettings")).toBe(false)
			expect(controller.isWriteProtected(".rooconfig")).toBe(false)
		})

		it("should not protect regular files", () => {
			expect(controller.isWriteProtected("src/index.ts")).toBe(false)
			expect(controller.isWriteProtected("package.json")).toBe(false)
			expect(controller.isWriteProtected("README.md")).toBe(false)
		})

		it("should not protect files that contain 'roo' but don't start with .roo", () => {
			expect(controller.isWriteProtected("src/roo-utils.ts")).toBe(false)
			expect(controller.isWriteProtected("config/roo.config.js")).toBe(false)
		})

		it("should handle nested paths correctly", () => {
			expect(controller.isWriteProtected(".ali/config.json")).toBe(true) // .ali/** matches at root
			expect(controller.isWriteProtected("nested/.aliignore")).toBe(true) // .aliignore matches anywhere by default
			expect(controller.isWriteProtected("nested/.alimodes")).toBe(true) // .alimodes matches anywhere by default
			expect(controller.isWriteProtected("nested/.alirules.md")).toBe(true) // .alirules* matches anywhere by default
		})

		it("should handle absolute paths by converting to relative", () => {
			const absolutePath = path.join(TEST_CWD, ".aliignore")
			expect(controller.isWriteProtected(absolutePath)).toBe(true)
		})

		it("should handle paths with different separators", () => {
			expect(controller.isWriteProtected(".ali\\config.json")).toBe(true)
			expect(controller.isWriteProtected(".ali/config.json")).toBe(true)
		})

		it("should not throw for absolute paths outside cwd", () => {
			expect(controller.isWriteProtected("/tmp/comment-2-pr63.json")).toBe(false)
			expect(controller.isWriteProtected("/etc/passwd")).toBe(false)
		})
	})

	describe("getProtectedFiles", () => {
		it("should return set of protected files from a list", () => {
			const files = ["src/index.ts", ".aliignore", "package.json", ".ali/config.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set([".aliignore", ".ali/config.json"]))
		})

		it("should return empty set when no files are protected", () => {
			const files = ["src/index.ts", "package.json", "README.md"]

			const protectedFiles = controller.getProtectedFiles(files)

			expect(protectedFiles).toEqual(new Set())
		})
	})

	describe("annotatePathsWithProtection", () => {
		it("should annotate paths with protection status", () => {
			const files = ["src/index.ts", ".aliignore", ".ali/config.json", "package.json"]

			const annotated = controller.annotatePathsWithProtection(files)

			expect(annotated).toEqual([
				{ path: "src/index.ts", isProtected: false },
				{ path: ".aliignore", isProtected: true },
				{ path: ".ali/config.json", isProtected: true },
				{ path: "package.json", isProtected: false },
			])
		})
	})

	describe("getProtectionMessage", () => {
		it("should return appropriate protection message", () => {
			const message = controller.getProtectionMessage()
			expect(message).toBe("This is a Ali configuration file and requires approval for modifications")
		})
	})

	describe("getInstructions", () => {
		it("should return formatted instructions about protected files", () => {
			const instructions = controller.getInstructions()

			expect(instructions).toContain("# Protected Files")
			expect(instructions).toContain("write-protected")
			expect(instructions).toContain(".aliignore")
			expect(instructions).toContain(".ali/**")
			expect(instructions).toContain("\u{1F6E1}") // Shield symbol
		})
	})

	describe("getProtectedPatterns", () => {
		it("should return the list of protected patterns", () => {
			const patterns = AliProtectedController.getProtectedPatterns()

			expect(patterns).toEqual([
				".aliignore",
				".alimodes",
				".alirules*",
				".clinerules*",
				".ali/**",
				".vscode/**",
				"*.code-workspace",
				".aliprotected",
				"AGENTS.md",
				"AGENT.md",
			])
		})
	})
})
