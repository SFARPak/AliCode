export interface ErrorDiagnosticsValues {
	timestamp?: string
	version?: string
	provider?: string
	model?: string
	details?: string
}
export interface GenerateDiagnosticsParams {
	taskId: string
	globalStoragePath: string
	values?: ErrorDiagnosticsValues
	log: (message: string) => void
}
export interface GenerateDiagnosticsResult {
	success: boolean
	filePath?: string
	error?: string
}
/**
 * Generates an error diagnostics file containing error metadata and API conversation history.
 * The file is created in the system temp directory and opened in VS Code for the user to review
 * before sharing with support.
 */
export declare function generateErrorDiagnostics(params: GenerateDiagnosticsParams): Promise<GenerateDiagnosticsResult>
//# sourceMappingURL=diagnosticsHandler.d.ts.map
