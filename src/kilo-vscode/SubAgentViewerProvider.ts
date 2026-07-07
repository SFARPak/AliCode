// Wrapper for SubAgentViewerProvider from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.

import { SubAgentViewerProvider as OriginalSubAgentViewerProvider } from "../../kilocode_tmp/packages/kilo-vscode/src/SubAgentViewerProvider"

export class SubAgentViewerProvider extends OriginalSubAgentViewerProvider {}
