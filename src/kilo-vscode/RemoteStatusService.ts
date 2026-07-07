// Wrapper for RemoteStatusService from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.

import { RemoteStatusService as OriginalRemoteStatusService } from "../../kilocode_tmp/packages/kilo-vscode/src/services/RemoteStatusService"

export class RemoteStatusService extends OriginalRemoteStatusService {}
