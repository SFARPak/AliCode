// Wrapper for KiloProvider from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.

import { KiloProvider as OriginalKiloProvider } from "../../kilocode_tmp/packages/kilo-vscode/src/KiloProvider"

export class KiloProvider extends OriginalKiloProvider {}
