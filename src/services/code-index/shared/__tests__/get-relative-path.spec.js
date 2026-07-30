"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const path_1 = __importDefault(require("path"))
const get_relative_path_1 = require("../get-relative-path")
describe("get-relative-path", () => {
	describe("generateNormalizedAbsolutePath", () => {
		it("should use provided workspace root", () => {
			const filePath = "src/file.ts"
			const workspaceRoot = path_1.default.join(path_1.default.sep, "custom", "workspace")
			const result = (0, get_relative_path_1.generateNormalizedAbsolutePath)(filePath, workspaceRoot)
			// On Windows, path.resolve adds the drive letter, so we need to use path.resolve for the expected value
			expect(result).toBe(path_1.default.resolve(workspaceRoot, filePath))
		})
		it("should handle absolute paths", () => {
			const filePath = path_1.default.join(path_1.default.sep, "absolute", "path", "file.ts")
			const workspaceRoot = path_1.default.join(path_1.default.sep, "custom", "workspace")
			const result = (0, get_relative_path_1.generateNormalizedAbsolutePath)(filePath, workspaceRoot)
			// When an absolute path is provided, it should be resolved to include drive letter on Windows
			expect(result).toBe(path_1.default.resolve(filePath))
		})
		it("should normalize paths with . and .. segments", () => {
			const filePath = "./src/../src/file.ts"
			const workspaceRoot = path_1.default.join(path_1.default.sep, "custom", "workspace")
			const result = (0, get_relative_path_1.generateNormalizedAbsolutePath)(filePath, workspaceRoot)
			// Use path.resolve to get the expected normalized absolute path
			expect(result).toBe(path_1.default.resolve(workspaceRoot, "src", "file.ts"))
		})
	})
	describe("generateRelativeFilePath", () => {
		it("should use provided workspace root", () => {
			const workspaceRoot = path_1.default.join(path_1.default.sep, "custom", "workspace")
			const absolutePath = path_1.default.join(workspaceRoot, "src", "file.ts")
			const result = (0, get_relative_path_1.generateRelativeFilePath)(absolutePath, workspaceRoot)
			expect(result).toBe(path_1.default.join("src", "file.ts"))
		})
		it("should handle paths outside workspace", () => {
			const absolutePath = path_1.default.join(path_1.default.sep, "outside", "workspace", "file.ts")
			const workspaceRoot = path_1.default.join(path_1.default.sep, "custom", "workspace")
			const result = (0, get_relative_path_1.generateRelativeFilePath)(absolutePath, workspaceRoot)
			// The result will have .. segments to navigate outside
			expect(result).toContain("..")
		})
		it("should handle same path as workspace", () => {
			const workspaceRoot = path_1.default.join(path_1.default.sep, "custom", "workspace")
			const absolutePath = workspaceRoot
			const result = (0, get_relative_path_1.generateRelativeFilePath)(absolutePath, workspaceRoot)
			expect(result).toBe(".")
		})
		it("should handle multi-workspace scenarios", () => {
			// Simulate the error scenario from the issue
			const workspaceRoot = path_1.default.join(path_1.default.sep, "Users", "test", "project")
			const absolutePath = path_1.default.join(path_1.default.sep, "Users", "test", "admin", ".prettierrc.json")
			const result = (0, get_relative_path_1.generateRelativeFilePath)(absolutePath, workspaceRoot)
			// Should generate a valid relative path, not throw an error
			expect(result).toBe(path_1.default.join("..", "admin", ".prettierrc.json"))
		})
	})
})
