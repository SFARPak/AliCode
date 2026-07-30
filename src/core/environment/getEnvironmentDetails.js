"use strict"
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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.getEnvironmentDetails = getEnvironmentDetails
const path_1 = __importDefault(require("path"))
const os_1 = __importDefault(require("os"))
const vscode = __importStar(require("vscode"))
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const delay_1 = __importDefault(require("delay"))
const language_1 = require("../../shared/language")
const modes_1 = require("../../shared/modes")
const getApiMetrics_1 = require("../../shared/getApiMetrics")
const list_files_1 = require("../../services/glob/list-files")
const TerminalRegistry_1 = require("../../integrations/terminal/TerminalRegistry")
const Terminal_1 = require("../../integrations/terminal/Terminal")
const path_2 = require("../../utils/path")
const responses_1 = require("../prompts/responses")
const git_1 = require("../../utils/git")
const reminder_1 = require("./reminder")
async function getEnvironmentDetails(cline, includeFileDetails = false) {
	let details = ""
	const clineProvider = cline.providerRef.deref()
	const state = await clineProvider?.getState()
	const { maxWorkspaceFiles = 200 } = state ?? {}
	// It could be useful for cline to know if the user went from one or no
	// file to another between messages, so we always include this context.
	const visibleFilePaths = vscode.window.visibleTextEditors
		?.map((editor) => editor.document?.uri?.fsPath)
		.filter(Boolean)
		.map((absolutePath) => path_1.default.relative(cline.cwd, absolutePath))
		.slice(0, maxWorkspaceFiles)
	// Filter paths through aliIgnoreController
	const allowedVisibleFiles = cline.aliIgnoreController
		? cline.aliIgnoreController.filterPaths(visibleFilePaths)
		: visibleFilePaths.map((p) => p.toPosix()).join("\n")
	if (allowedVisibleFiles) {
		details += "\n\n# VSCode Visible Files"
		details += `\n${allowedVisibleFiles}`
	}
	const { maxOpenTabsContext } = state ?? {}
	const maxTabs = maxOpenTabsContext ?? 20
	const openTabPaths = vscode.window.tabGroups.all
		.flatMap((group) => group.tabs)
		.filter((tab) => tab.input instanceof vscode.TabInputText)
		.map((tab) => tab.input.uri.fsPath)
		.filter(Boolean)
		.map((absolutePath) => path_1.default.relative(cline.cwd, absolutePath).toPosix())
		.slice(0, maxTabs)
	// Filter paths through aliIgnoreController
	const allowedOpenTabs = cline.aliIgnoreController
		? cline.aliIgnoreController.filterPaths(openTabPaths)
		: openTabPaths.map((p) => p.toPosix()).join("\n")
	if (allowedOpenTabs) {
		details += "\n\n# VSCode Open Tabs"
		details += `\n${allowedOpenTabs}`
	}
	// Get task-specific and background terminals.
	const busyTerminals = [
		...TerminalRegistry_1.TerminalRegistry.getTerminals(true, cline.taskId),
		...TerminalRegistry_1.TerminalRegistry.getBackgroundTerminals(true),
	]
	const inactiveTerminals = [
		...TerminalRegistry_1.TerminalRegistry.getTerminals(false, cline.taskId),
		...TerminalRegistry_1.TerminalRegistry.getBackgroundTerminals(false),
	]
	if (busyTerminals.length > 0) {
		if (cline.didEditFile) {
			await (0, delay_1.default)(300) // Delay after saving file to let terminals catch up.
		}
		// Wait for terminals to cool down.
		await (0, p_wait_for_1.default)(
			() => busyTerminals.every((t) => !TerminalRegistry_1.TerminalRegistry.isProcessHot(t.id)),
			{
				interval: 100,
				timeout: 5_000,
			},
		).catch(() => {})
	}
	// Reset, this lets us know when to wait for saved files to update terminals.
	cline.didEditFile = false
	// Waiting for updated diagnostics lets terminal output be the most
	// up-to-date possible.
	let terminalDetails = ""
	if (busyTerminals.length > 0) {
		// Terminals are cool, let's retrieve their output.
		terminalDetails += "\n\n# Actively Running Terminals"
		for (const busyTerminal of busyTerminals) {
			const cwd = busyTerminal.getCurrentWorkingDirectory()
			terminalDetails += `\n## Terminal ${busyTerminal.id} (Active)`
			terminalDetails += `\n### Working Directory: \`${cwd}\``
			terminalDetails += `\n### Original command: \`${busyTerminal.getLastCommand()}\``
			let newOutput = TerminalRegistry_1.TerminalRegistry.getUnretrievedOutput(busyTerminal.id)
			if (newOutput) {
				newOutput = Terminal_1.Terminal.compressTerminalOutput(newOutput)
				terminalDetails += `\n### New Output\n${newOutput}`
			}
		}
	}
	// First check if any inactive terminals in this task have completed
	// processes with output.
	const terminalsWithOutput = inactiveTerminals.filter((terminal) => {
		const completedProcesses = terminal.getProcessesWithOutput()
		return completedProcesses.length > 0
	})
	// Only add the header if there are terminals with output.
	if (terminalsWithOutput.length > 0) {
		terminalDetails += "\n\n# Inactive Terminals with Completed Process Output"
		// Process each terminal with output.
		for (const inactiveTerminal of terminalsWithOutput) {
			let terminalOutputs = []
			// Get output from completed processes queue.
			const completedProcesses = inactiveTerminal.getProcessesWithOutput()
			for (const process of completedProcesses) {
				let output = process.getUnretrievedOutput()
				if (output) {
					output = Terminal_1.Terminal.compressTerminalOutput(output)
					terminalOutputs.push(`Command: \`${process.command}\`\n${output}`)
				}
			}
			// Clean the queue after retrieving output.
			inactiveTerminal.cleanCompletedProcessQueue()
			// Add this terminal's outputs to the details.
			if (terminalOutputs.length > 0) {
				const cwd = inactiveTerminal.getCurrentWorkingDirectory()
				terminalDetails += `\n## Terminal ${inactiveTerminal.id} (Inactive)`
				terminalDetails += `\n### Working Directory: \`${cwd}\``
				terminalOutputs.forEach((output) => {
					terminalDetails += `\n### New Output\n${output}`
				})
			}
		}
	}
	// console.log(`[Task#getEnvironmentDetails] terminalDetails: ${terminalDetails}`)
	// Add recently modified files section.
	const recentlyModifiedFiles = cline.fileContextTracker.getAndClearRecentlyModifiedFiles()
	if (recentlyModifiedFiles.length > 0) {
		details +=
			"\n\n# Recently Modified Files\nThese files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):"
		for (const filePath of recentlyModifiedFiles) {
			details += `\n${filePath}`
		}
	}
	if (terminalDetails) {
		details += terminalDetails
	}
	// Get settings for time and cost display
	const { includeCurrentTime = true, includeCurrentCost = true, maxGitStatusFiles = 0 } = state ?? {}
	// Add current time information with timezone (if enabled).
	if (includeCurrentTime) {
		const now = new Date()
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
		const timeZoneOffset = -now.getTimezoneOffset() / 60 // Convert to hours and invert sign to match conventional notation
		const timeZoneOffsetHours = Math.floor(Math.abs(timeZoneOffset))
		const timeZoneOffsetMinutes = Math.abs(Math.round((Math.abs(timeZoneOffset) - timeZoneOffsetHours) * 60))
		const timeZoneOffsetStr = `${timeZoneOffset >= 0 ? "+" : "-"}${timeZoneOffsetHours}:${timeZoneOffsetMinutes.toString().padStart(2, "0")}`
		details += `\n\n# Current Time\nCurrent time in ISO 8601 UTC format: ${now.toISOString()}\nUser time zone: ${timeZone}, UTC${timeZoneOffsetStr}`
	}
	// Add git status information (if enabled with maxGitStatusFiles > 0).
	if (maxGitStatusFiles > 0) {
		const gitStatus = await (0, git_1.getGitStatus)(cline.cwd, maxGitStatusFiles)
		if (gitStatus) {
			details += `\n\n# Git Status\n${gitStatus}`
		}
	}
	// Add context tokens information (if enabled).
	if (includeCurrentCost) {
		const { totalCost } = (0, getApiMetrics_1.getApiMetrics)(cline.clineMessages)
		details += `\n\n# Current Cost\n${totalCost !== null ? `$${totalCost.toFixed(2)}` : "(Not available)"}`
	}
	const { id: modelId } = cline.api.getModel()
	// Add current mode and any mode-specific warnings.
	const {
		mode,
		customModes,
		customModePrompts,
		experiments = {},
		customInstructions: globalCustomInstructions,
		language,
	} = state ?? {}
	const currentMode = mode ?? modes_1.defaultModeSlug
	const modeDetails = await (0, modes_1.getFullModeDetails)(currentMode, customModes, customModePrompts, {
		cwd: cline.cwd,
		globalCustomInstructions,
		language: language ?? (0, language_1.formatLanguage)(vscode.env.language),
	})
	details += `\n\n# Current Mode\n`
	details += `<slug>${currentMode}</slug>\n`
	details += `<name>${modeDetails.name}</name>\n`
	details += `<model>${modelId}</model>\n`
	if (includeFileDetails) {
		details += `\n\n# Current Workspace Directory (${cline.cwd.toPosix()}) Files\n`
		const isDesktop = (0, path_2.arePathsEqual)(cline.cwd, path_1.default.join(os_1.default.homedir(), "Desktop"))
		if (isDesktop) {
			// Don't want to immediately access desktop since it would show
			// permission popup.
			details += "(Desktop files not shown automatically. Use list_files to explore if needed.)"
		} else {
			const maxFiles = maxWorkspaceFiles ?? 200
			// Early return for limit of 0
			if (maxFiles === 0) {
				details += "(Workspace files context disabled. Use list_files to explore if needed.)"
			} else {
				const [files, didHitLimit] = await (0, list_files_1.listFiles)(cline.cwd, true, maxFiles)
				const { showAliIgnoredFiles = false } = state ?? {}
				const result = responses_1.formatResponse.formatFilesList(
					cline.cwd,
					files,
					didHitLimit,
					cline.aliIgnoreController,
					showAliIgnoredFiles,
				)
				details += result
			}
		}
	}
	const todoListEnabled =
		state && typeof state.apiConfiguration?.todoListEnabled === "boolean"
			? state.apiConfiguration.todoListEnabled
			: true
	const reminderSection = todoListEnabled ? (0, reminder_1.formatReminderSection)(cline.todoList) : ""
	return `<environment_details>\n${details.trim()}\n${reminderSection}\n</environment_details>`
}
