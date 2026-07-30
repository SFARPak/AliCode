"use strict"
// Wrapper for SettingsEditorProvider from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.
Object.defineProperty(exports, "__esModule", { value: true })
exports.SettingsEditorProvider = void 0
const SettingsEditorProvider_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/SettingsEditorProvider")
class SettingsEditorProvider extends SettingsEditorProvider_1.SettingsEditorProvider {}
exports.SettingsEditorProvider = SettingsEditorProvider
