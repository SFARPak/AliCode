import * as vscode from "vscode"
export declare function openImage(
	dataUriOrPath: string,
	options?: {
		values?: {
			action?: string
		}
	},
): Promise<void>
export declare function saveImage(dataUri: string, defaultUri: vscode.Uri): Promise<vscode.Uri | undefined>
//# sourceMappingURL=image-handler.d.ts.map
