"use strict"
// src/integrations/terminal/__tests__/TerminalProcessExec.common.ts
Object.defineProperty(exports, "__esModule", { value: true })
exports.TEST_TEXT = exports.LARGE_OUTPUT_PARAMS = exports.TEST_PURPOSES = void 0
/**
 * Common test categories and purposes for all shells
 * Each shell implementation will use different commands to test the same functionality
 */
exports.TEST_PURPOSES = {
	// Basic command output tests
	BASIC_OUTPUT: "should execute a basic command and return expected output",
	OUTPUT_WITHOUT_NEWLINE: "should execute command without newline at the end",
	MULTILINE_OUTPUT: "should handle multiline output",
	// Exit code tests
	EXIT_CODE_SUCCESS: "should handle successful exit code (0)",
	EXIT_CODE_ERROR: "should handle error exit code (1)",
	EXIT_CODE_CUSTOM: "should handle custom exit code (2)",
	// Error handling
	COMMAND_NOT_FOUND: "should handle command not found errors",
	// Advanced tests
	CONTROL_SEQUENCES: "should simulate terminal control sequences",
	LARGE_OUTPUT: "should handle larger output streams",
	// Signal handling (primarily for bash)
	SIGNAL_TERMINATION: "should interpret SIGTERM exit code",
	SIGNAL_SEGV: "should interpret SIGSEGV exit code",
}
/**
 * Test parameters for large output stream tests
 */
exports.LARGE_OUTPUT_PARAMS = {
	LINES: 10, // Number of lines to generate for large output tests
}
/**
 * Sample text for various test outputs
 */
exports.TEST_TEXT = {
	BASIC: "a",
	MULTILINE_FIRST: "a",
	MULTILINE_SECOND: "b",
	LARGE_PREFIX: "Line ",
}
