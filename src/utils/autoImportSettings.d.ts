import * as vscode from "vscode"
import { ImportOptions } from "../core/config/importExport"
/**
 * Automatically imports AliCode settings from a specified path if it exists.
 * This function is called during extension activation to allow users to pre-configure
 * their settings by placing a settings file at a predefined location.
 */
export declare function autoImportSettings(
	outputChannel: vscode.OutputChannel,
	{ providerSettingsManager, contextProxy, customModesManager }: ImportOptions,
): Promise<void>
//# sourceMappingURL=autoImportSettings.d.ts.map
