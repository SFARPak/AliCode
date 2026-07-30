"use strict"
// Wrapper for KiloProvider from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.
Object.defineProperty(exports, "__esModule", { value: true })
exports.KiloProvider = void 0
const KiloProvider_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/KiloProvider")
class KiloProvider extends KiloProvider_1.KiloProvider {}
exports.KiloProvider = KiloProvider
