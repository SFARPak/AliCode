"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.isWriteToolAction = isWriteToolAction
exports.isReadOnlyToolAction = isReadOnlyToolAction
function isWriteToolAction(tool) {
	return ["editedExistingFile", "appliedDiff", "newFileCreated", "generateImage"].includes(tool.tool)
}
function isReadOnlyToolAction(tool) {
	return [
		"readFile",
		"listFiles",
		"listFilesTopLevel",
		"listFilesRecursive",
		"searchFiles",
		"codebaseSearch",
		"runSlashCommand",
	].includes(tool.tool)
}
