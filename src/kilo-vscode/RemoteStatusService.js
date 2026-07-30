"use strict"
// Wrapper for RemoteStatusService from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.
Object.defineProperty(exports, "__esModule", { value: true })
exports.RemoteStatusService = void 0
const RemoteStatusService_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/services/RemoteStatusService")
class RemoteStatusService extends RemoteStatusService_1.RemoteStatusService {}
exports.RemoteStatusService = RemoteStatusService
