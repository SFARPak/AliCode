"use strict"
// npx vitest src/integrations/terminal/__tests__/TerminalProcessExec.cmd.spec.ts
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
const vscode = __importStar(require("vscode"))
const TerminalProcess_1 = require("../TerminalProcess")
const Terminal_1 = require("../Terminal")
const TerminalRegistry_1 = require("../TerminalRegistry")
const cmdStream_1 = require("./streamUtils/cmdStream")
const streamUtils_1 = require("./streamUtils")
// Skip this test on non-Windows platforms
const isWindows = process.platform === "win32"
const describePlatform = isWindows ? describe : describe.skip
// Mock the vscode module
vi.mock("vscode", () => {
	// Store event handlers so we can trigger them in tests
	const eventHandlers = {
		startTerminalShellExecution: null,
		endTerminalShellExecution: null,
		closeTerminal: null,
	}
	return {
		workspace: {
			getConfiguration: vi.fn().mockReturnValue({
				get: vi.fn().mockReturnValue(null),
			}),
		},
		window: {
			createTerminal: vi.fn(),
			onDidStartTerminalShellExecution: vi.fn().mockImplementation((handler) => {
				eventHandlers.startTerminalShellExecution = handler
				return { dispose: vi.fn() }
			}),
			onDidEndTerminalShellExecution: vi.fn().mockImplementation((handler) => {
				eventHandlers.endTerminalShellExecution = handler
				return { dispose: vi.fn() }
			}),
			onDidCloseTerminal: vi.fn().mockImplementation((handler) => {
				eventHandlers.closeTerminal = handler
				return { dispose: vi.fn() }
			}),
		},
		ThemeIcon: class ThemeIcon {
			constructor(id) {
				this.id = id
			}
			id
		},
		Uri: {
			file: (path) => ({ fsPath: path }),
		},
		// Expose event handlers for testing
		__eventHandlers: eventHandlers,
	}
})
vi.mock("execa", () => ({
	execa: vi.fn(),
}))
/**
 * Test CMD command execution
 * @param command The CMD command to execute
 * @param expectedOutput The expected output after processing
 * @param useMock Optional flag to use mock stream instead of real command
 * @returns Test results including execution time and exit details
 */
async function testCmdCommand(command, expectedOutput, useMock = false) {
	let startTime = BigInt(0)
	let endTime = BigInt(0)
	let timeRecorded = false
	// Create a mock terminal with shell integration
	const mockTerminal = {
		shellIntegration: {
			executeCommand: vi.fn(),
			cwd: vscode.Uri.file("C:\\test\\path"),
		},
		name: "AliCode",
		processId: Promise.resolve(123),
		creationOptions: {},
		exitStatus: undefined,
		state: { isInteractedWith: true, shell: undefined },
		dispose: vi.fn(),
		hide: vi.fn(),
		show: vi.fn(),
		sendText: vi.fn(),
	}
	// Create terminal info with running state
	const mockTerminalInfo = new Terminal_1.Terminal(1, mockTerminal, "C:\\test\\path")
	mockTerminalInfo.running = true
	// Add the terminal to the registry
	TerminalRegistry_1.TerminalRegistry["terminals"] = [mockTerminalInfo]
	// Create a new terminal process for testing
	startTime = process.hrtime.bigint() // Start timing from terminal process creation
	const terminalProcess = new TerminalProcess_1.TerminalProcess(mockTerminalInfo)
	try {
		// Set up the stream - either real command output or mock
		let stream, exitCode
		if (useMock) {
			// Use CMD-specific mock stream with predefined output
			;({ stream, exitCode } = (0, streamUtils_1.createCmdMockStream)(expectedOutput))
		} else {
			// Set up the real command stream
			;({ stream, exitCode } = (0, cmdStream_1.createCmdCommandStream)(command))
		}
		// Configure the mock terminal to return our stream
		mockTerminal.shellIntegration.executeCommand.mockImplementation(() => {
			return {
				read: vi.fn().mockReturnValue(stream),
			}
		})
		// Set up event listeners to capture output
		let capturedOutput = ""
		terminalProcess.on("completed", (output) => {
			if (!timeRecorded) {
				endTime = process.hrtime.bigint() // End timing when completed event is received with output
				timeRecorded = true
			}
			if (output) {
				capturedOutput = output
			}
		})
		// Create a promise that resolves when the command completes
		const completedPromise = new Promise((resolve) => {
			terminalProcess.once("completed", () => {
				resolve()
			})
		})
		// Set the process on the terminal
		mockTerminalInfo.process = terminalProcess
		// Get the event handlers from the mock
		const eventHandlers = vscode.__eventHandlers
		// Execute the command first to set up the process
		terminalProcess.run(command)
		// Trigger the start terminal shell execution event through VSCode mock
		if (eventHandlers.startTerminalShellExecution) {
			eventHandlers.startTerminalShellExecution({
				terminal: mockTerminal,
				execution: {
					commandLine: { value: command },
					read: () => stream,
				},
			})
		}
		// Wait for some output to be processed
		await new Promise((resolve) => {
			const onLine = () => {
				terminalProcess.removeListener("line", onLine)
				if (timeoutId) {
					clearTimeout(timeoutId)
				}
				resolve()
			}
			terminalProcess.on("line", onLine)
			// Add a timeout in case no lines are emitted
			const timeoutId = setTimeout(() => {
				terminalProcess.removeListener("line", onLine)
				resolve()
			}, 500)
		})
		// Then trigger the end event
		if (eventHandlers.endTerminalShellExecution) {
			eventHandlers.endTerminalShellExecution({
				terminal: mockTerminal,
				exitCode: exitCode,
			})
		}
		// Store exit details for return
		const exitDetails = TerminalProcess_1.TerminalProcess.interpretExitCode(exitCode)
		// Set a timeout to avoid hanging tests
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error("Test timed out after 1000ms"))
			}, 1000)
		})
		// Wait for the command to complete or timeout
		await Promise.race([completedPromise, timeoutPromise])
		// Calculate execution time in microseconds
		if (!timeRecorded) {
			endTime = process.hrtime.bigint()
		}
		const executionTimeUs = Number((endTime - startTime) / BigInt(1000))
		// Verify the output matches the expected output
		expect(capturedOutput).toBe(expectedOutput)
		return { executionTimeUs, capturedOutput, exitDetails }
	} finally {
		// Clean up
		terminalProcess.removeAllListeners()
		TerminalRegistry_1.TerminalRegistry["terminals"] = []
		// Ensure we don't have any lingering timeouts
		// This is a safety measure in case the test exits before the timeout is cleared
		if (typeof global.gc === "function") {
			global.gc() // Force garbage collection if available
		}
	}
}
// Import the test purposes from the common file
const TerminalProcessExec_common_1 = require("./TerminalProcessExec.common")
describePlatform("TerminalProcess with CMD Command Output", () => {
	beforeAll(() => {
		// Initialize TerminalRegistry event handlers
		TerminalRegistry_1.TerminalRegistry.initialize()
		// Log environment info
		console.log(`Running CMD tests on Windows ${process.env.OS} ${process.arch}`)
	})
	beforeEach(() => {
		// Reset state between tests
		TerminalRegistry_1.TerminalRegistry["terminals"] = []
		vi.clearAllMocks()
	})
	// Each test uses CMD-specific commands to test the same functionality
	it(TerminalProcessExec_common_1.TEST_PURPOSES.BASIC_OUTPUT, async () => {
		const { executionTimeUs, capturedOutput } = await testCmdCommand("echo a", "a\r\n")
		console.log(`'echo a' execution time: ${executionTimeUs} microseconds (${executionTimeUs / 1000} ms)`)
		expect(capturedOutput).toBe("a\r\n")
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.OUTPUT_WITHOUT_NEWLINE, async () => {
		// Windows CMD equivalent for echo without newline
		const { executionTimeUs } = await testCmdCommand("echo | set /p dummy=a", "a")
		console.log(`'echo | set /p dummy=a' execution time: ${executionTimeUs} microseconds`)
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.MULTILINE_OUTPUT, async () => {
		const expectedOutput = "a\r\nb\r\n"
		// Windows multiline command
		const { executionTimeUs } = await testCmdCommand('cmd /c "echo a&echo b"', expectedOutput)
		console.log(`Multiline command execution time: ${executionTimeUs} microseconds`)
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.EXIT_CODE_SUCCESS, async () => {
		// Success exit code
		const { exitDetails } = await testCmdCommand("exit /b 0", "")
		expect(exitDetails).toEqual({ exitCode: 0 })
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.EXIT_CODE_ERROR, async () => {
		// Error exit code
		const { exitDetails } = await testCmdCommand("exit /b 1", "")
		expect(exitDetails).toEqual({ exitCode: 1 })
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.EXIT_CODE_CUSTOM, async () => {
		// Custom exit code
		const { exitDetails } = await testCmdCommand("exit /b 2", "")
		expect(exitDetails).toEqual({ exitCode: 2 })
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.COMMAND_NOT_FOUND, async () => {
		const { exitDetails } = await testCmdCommand("nonexistentcommand", "")
		expect(exitDetails.exitCode).not.toBe(0)
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.CONTROL_SEQUENCES, async () => {
		// This test uses a mock to simulate complex terminal output
		// On Windows, ANSI escape sequences are often stripped, so we expect the plain text
		const expectedOutput = "Red Text\r\n"
		const { capturedOutput } = await testCmdCommand("echo Red Text", expectedOutput)
		expect(capturedOutput).toBe(expectedOutput)
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.LARGE_OUTPUT, async () => {
		// Generate a larger output stream
		const lines = TerminalProcessExec_common_1.LARGE_OUTPUT_PARAMS.LINES
		const command = `cmd /c "for /L %i in (1,1,${lines}) do @echo ${TerminalProcessExec_common_1.TEST_TEXT.LARGE_PREFIX}%i"`
		// Build expected output - note that CMD uses \r\n line endings
		const expectedOutput =
			Array.from(
				{ length: lines },
				(_, i) => `${TerminalProcessExec_common_1.TEST_TEXT.LARGE_PREFIX}${i + 1}`,
			).join("\r\n") + "\r\n"
		const { executionTimeUs } = await testCmdCommand(command, expectedOutput)
		console.log(`Large output command (${lines} lines) execution time: ${executionTimeUs} microseconds`)
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.SIGNAL_TERMINATION, async () => {
		// Simulate SIGTERM in CMD (Windows doesn't have direct signals)
		const { exitDetails } = await testCmdCommand("exit /b 143", "")
		expect(exitDetails).toEqual({
			exitCode: 143, // 128 + 15 (SIGTERM)
			signal: 15,
			signalName: "SIGTERM",
			coreDumpPossible: false,
		})
	})
	it(TerminalProcessExec_common_1.TEST_PURPOSES.SIGNAL_SEGV, async () => {
		// Simulate SIGSEGV in CMD
		const { exitDetails } = await testCmdCommand("exit /b 139", "")
		expect(exitDetails).toEqual({
			exitCode: 139, // 128 + 11 (SIGSEGV)
			signal: 11,
			signalName: "SIGSEGV",
			coreDumpPossible: true,
		})
	})
})
