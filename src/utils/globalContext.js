"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ensureSettingsDirectoryExists = ensureSettingsDirectoryExists
const storage_1 = require("./storage")
async function ensureSettingsDirectoryExists(context) {
	// getSettingsDirectoryPath already handles the custom storage path setting
	return await (0, storage_1.getSettingsDirectoryPath)(context.globalStorageUri.fsPath)
}
