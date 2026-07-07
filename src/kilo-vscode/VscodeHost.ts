// Wrapper for VscodeHost from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.

import { VscodeHost as OriginalVscodeHost } from "../../kilocode_tmp/packages/kilo-vscode/src/agent-manager/vscode-host"

export class VscodeHost extends OriginalVscodeHost {}
