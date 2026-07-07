// Wrapper for SettingsEditorProvider from kilo-vscode source
// Re-exports the original implementation for use in the AliCode extension.

import { SettingsEditorProvider as OriginalSettingsEditorProvider } from "../../kilocode_tmp/packages/kilo-vscode/src/SettingsEditorProvider"

export class SettingsEditorProvider extends OriginalSettingsEditorProvider {}
