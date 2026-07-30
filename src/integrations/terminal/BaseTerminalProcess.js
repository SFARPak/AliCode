"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.BaseTerminalProcess = void 0
const events_1 = require("events")
class BaseTerminalProcess extends events_1.EventEmitter {
	command = ""
	isHot = false
	hotTimer = null
	isListening = true
	lastEmitTime_ms = 0
	fullOutput = ""
	lastRetrievedIndex = 0
	static interpretExitCode(exitCode) {
		if (exitCode === undefined) {
			return { exitCode }
		}
		if (exitCode <= 128) {
			return { exitCode }
		}
		const signal = exitCode - 128
		const signals = {
			// Standard signals
			1: "SIGHUP",
			2: "SIGINT",
			3: "SIGQUIT",
			4: "SIGILL",
			5: "SIGTRAP",
			6: "SIGABRT",
			7: "SIGBUS",
			8: "SIGFPE",
			9: "SIGKILL",
			10: "SIGUSR1",
			11: "SIGSEGV",
			12: "SIGUSR2",
			13: "SIGPIPE",
			14: "SIGALRM",
			15: "SIGTERM",
			16: "SIGSTKFLT",
			17: "SIGCHLD",
			18: "SIGCONT",
			19: "SIGSTOP",
			20: "SIGTSTP",
			21: "SIGTTIN",
			22: "SIGTTOU",
			23: "SIGURG",
			24: "SIGXCPU",
			25: "SIGXFSZ",
			26: "SIGVTALRM",
			27: "SIGPROF",
			28: "SIGWINCH",
			29: "SIGIO",
			30: "SIGPWR",
			31: "SIGSYS",
			// Real-time signals base
			34: "SIGRTMIN",
			// SIGRTMIN+n signals
			35: "SIGRTMIN+1",
			36: "SIGRTMIN+2",
			37: "SIGRTMIN+3",
			38: "SIGRTMIN+4",
			39: "SIGRTMIN+5",
			40: "SIGRTMIN+6",
			41: "SIGRTMIN+7",
			42: "SIGRTMIN+8",
			43: "SIGRTMIN+9",
			44: "SIGRTMIN+10",
			45: "SIGRTMIN+11",
			46: "SIGRTMIN+12",
			47: "SIGRTMIN+13",
			48: "SIGRTMIN+14",
			49: "SIGRTMIN+15",
			// SIGRTMAX-n signals
			50: "SIGRTMAX-14",
			51: "SIGRTMAX-13",
			52: "SIGRTMAX-12",
			53: "SIGRTMAX-11",
			54: "SIGRTMAX-10",
			55: "SIGRTMAX-9",
			56: "SIGRTMAX-8",
			57: "SIGRTMAX-7",
			58: "SIGRTMAX-6",
			59: "SIGRTMAX-5",
			60: "SIGRTMAX-4",
			61: "SIGRTMAX-3",
			62: "SIGRTMAX-2",
			63: "SIGRTMAX-1",
			64: "SIGRTMAX",
		}
		// These signals may produce core dumps:
		//   SIGQUIT, SIGILL, SIGABRT, SIGBUS, SIGFPE, SIGSEGV
		const coreDumpPossible = new Set([3, 4, 6, 7, 8, 11])
		return {
			exitCode,
			signal,
			signalName: signals[signal] || `Unknown Signal (${signal})`,
			coreDumpPossible: coreDumpPossible.has(signal),
		}
	}
	/**
	 * Clears the internal output buffer when all content has been retrieved.
	 *
	 * This prevents unbounded memory growth when processing large
	 * command outputs by discarding data that has already been
	 * consumed by callers of `getUnretrievedOutput`.
	 *
	 * Called after command completion when `lastRetrievedIndex` has been
	 * set to `fullOutput.length` to indicate all output has been processed.
	 */
	trimRetrievedOutput() {
		if (this.lastRetrievedIndex >= this.fullOutput.length && this.fullOutput.length > 0) {
			this.fullOutput = ""
			this.lastRetrievedIndex = 0
		}
	}
	startHotTimer(data) {
		this.isHot = true
		if (this.hotTimer) {
			clearTimeout(this.hotTimer)
		}
		this.hotTimer = setTimeout(() => (this.isHot = false), BaseTerminalProcess.isCompiling(data) ? 15_000 : 2_000)
	}
	stopHotTimer() {
		if (this.hotTimer) {
			clearTimeout(this.hotTimer)
		}
		this.isHot = false
	}
	// These markers indicate the command is some kind of local dev
	// server recompiling the app, which we want to wait for output
	// of before sending request to AliCode.
	static compilingMarkers = ["compiling", "building", "bundling", "transpiling", "generating", "starting"]
	static compilingMarkerNullifiers = [
		"compiled",
		"success",
		"finish",
		"complete",
		"succeed",
		"done",
		"end",
		"stop",
		"exit",
		"terminate",
		"error",
		"fail",
	]
	static isCompiling(data) {
		return (
			BaseTerminalProcess.compilingMarkers.some((marker) => data.toLowerCase().includes(marker.toLowerCase())) &&
			!BaseTerminalProcess.compilingMarkerNullifiers.some((nullifier) =>
				data.toLowerCase().includes(nullifier.toLowerCase()),
			)
		)
	}
}
exports.BaseTerminalProcess = BaseTerminalProcess
