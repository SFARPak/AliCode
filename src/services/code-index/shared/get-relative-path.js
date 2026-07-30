"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.generateNormalizedAbsolutePath = generateNormalizedAbsolutePath
exports.generateRelativeFilePath = generateRelativeFilePath
const path_1 = __importDefault(require("path"))
/**
 * Generates a normalized absolute path from a given file path and workspace root.
 * Handles path resolution and normalization to ensure consistent absolute paths.
 *
 * @param filePath - The file path to normalize (can be relative or absolute)
 * @param workspaceRoot - The root directory of the workspace (required)
 * @returns The normalized absolute path
 */
function generateNormalizedAbsolutePath(filePath, workspaceRoot) {
	// Resolve the path to make it absolute if it's relative
	const resolvedPath = path_1.default.resolve(workspaceRoot, filePath)
	// Normalize to handle any . or .. segments and duplicate slashes
	return path_1.default.normalize(resolvedPath)
}
/**
 * Generates a relative file path from a normalized absolute path and workspace root.
 * Ensures consistent relative path generation across different platforms.
 *
 * @param normalizedAbsolutePath - The normalized absolute path to convert
 * @param workspaceRoot - The root directory of the workspace (required)
 * @returns The relative path from workspaceRoot to the file
 */
function generateRelativeFilePath(normalizedAbsolutePath, workspaceRoot) {
	// Generate the relative path
	const relativePath = path_1.default.relative(workspaceRoot, normalizedAbsolutePath)
	// Normalize to ensure consistent path separators
	return path_1.default.normalize(relativePath)
}
