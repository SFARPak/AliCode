"use strict"
// Wrapper for SubAgentViewerProvider from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.
Object.defineProperty(exports, "__esModule", { value: true })
exports.SubAgentViewerProvider = void 0
const SubAgentViewerProvider_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/SubAgentViewerProvider")
class SubAgentViewerProvider extends SubAgentViewerProvider_1.SubAgentViewerProvider {}
exports.SubAgentViewerProvider = SubAgentViewerProvider
