"use strict"
// Wrapper for VscodeHost from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.
Object.defineProperty(exports, "__esModule", { value: true })
exports.VscodeHost = void 0
const vscode_host_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/agent-manager/vscode-host")
class VscodeHost extends vscode_host_1.VscodeHost {}
exports.VscodeHost = VscodeHost
