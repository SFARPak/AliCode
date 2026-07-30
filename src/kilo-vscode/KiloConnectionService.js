"use strict"
// Wrapper for KiloConnectionService from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.
Object.defineProperty(exports, "__esModule", { value: true })
exports.KiloConnectionService = void 0
const connection_service_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/services/cli-backend/connection-service")
class KiloConnectionService extends connection_service_1.KiloConnectionService {}
exports.KiloConnectionService = KiloConnectionService
