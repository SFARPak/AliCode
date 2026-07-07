// Wrapper for KiloConnectionService from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.

import { KiloConnectionService as OriginalKiloConnectionService } from "../../kilocode_tmp/packages/kilo-vscode/src/services/cli-backend/connection-service"

export class KiloConnectionService extends OriginalKiloConnectionService {}
