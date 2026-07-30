"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ExecaTerminal = void 0
const BaseTerminal_1 = require("./BaseTerminal")
const ExecaTerminalProcess_1 = require("./ExecaTerminalProcess")
const mergePromise_1 = require("./mergePromise")
class ExecaTerminal extends BaseTerminal_1.BaseTerminal {
	constructor(id, cwd) {
		super("execa", id, cwd)
	}
	/**
	 * Unlike the VSCode terminal, this is never closed.
	 */
	isClosed() {
		return false
	}
	runCommand(command, callbacks) {
		this.busy = true
		const process = new ExecaTerminalProcess_1.ExecaTerminalProcess(this)
		process.command = command
		this.process = process
		process.on("line", (line) => callbacks.onLine(line, process))
		process.once("completed", (output) => callbacks.onCompleted(output, process))
		process.once("shell_execution_started", (pid) => callbacks.onShellExecutionStarted(pid, process))
		process.once("shell_execution_complete", (details) => callbacks.onShellExecutionComplete(details, process))
		const promise = new Promise((resolve, reject) => {
			process.once("continue", () => resolve())
			process.once("error", (error) => reject(error))
			process.run(command)
		})
		return (0, mergePromise_1.mergePromise)(process, promise)
	}
}
exports.ExecaTerminal = ExecaTerminal
