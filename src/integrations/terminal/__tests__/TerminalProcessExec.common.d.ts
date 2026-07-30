/**
 * Common test categories and purposes for all shells
 * Each shell implementation will use different commands to test the same functionality
 */
export declare const TEST_PURPOSES: {
	BASIC_OUTPUT: string
	OUTPUT_WITHOUT_NEWLINE: string
	MULTILINE_OUTPUT: string
	EXIT_CODE_SUCCESS: string
	EXIT_CODE_ERROR: string
	EXIT_CODE_CUSTOM: string
	COMMAND_NOT_FOUND: string
	CONTROL_SEQUENCES: string
	LARGE_OUTPUT: string
	SIGNAL_TERMINATION: string
	SIGNAL_SEGV: string
}
/**
 * Test parameters for large output stream tests
 */
export declare const LARGE_OUTPUT_PARAMS: {
	LINES: number
}
/**
 * Sample text for various test outputs
 */
export declare const TEST_TEXT: {
	BASIC: string
	MULTILINE_FIRST: string
	MULTILINE_SECOND: string
	LARGE_PREFIX: string
}
//# sourceMappingURL=TerminalProcessExec.common.d.ts.map
