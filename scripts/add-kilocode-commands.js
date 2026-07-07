// Script to add missing KiloCode command contributions to src/package.json using safeWriteJson
const fs = require("fs")
const path = require("path")
const { safeWriteJson } = require("../src/utils/safeWriteJson")
;(async () => {
	const pkgPath = path.join(__dirname, "..", "src", "package.json")
	const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
	const existing = pkg.contributes && pkg.contributes.commands ? pkg.contributes.commands.map((c) => c.command) : []
	const kiloCommands = [
		"kilo-code.new.plusButtonClicked",
		"kilo-code.new.agentManagerOpen",
		"kilo-code.new.kiloClawOpen",
		"kilo-code.new.marketplaceButtonClicked",
		"kilo-code.new.historyButtonClicked",
		"kilo-code.new.profileButtonClicked",
		"kilo-code.new.settingsButtonClicked",
		"kilo-code.new.sidebarTitle.plusButtonClicked",
		"kilo-code.new.sidebarTitle.agentManagerOpen",
		"kilo-code.new.sidebarTitle.kiloClawOpen",
		"kilo-code.new.sidebarTitle.marketplaceButtonClicked",
		"kilo-code.new.sidebarTitle.historyButtonClicked",
		"kilo-code.new.sidebarTitle.profileButtonClicked",
		"kilo-code.new.sidebarTitle.settingsButtonClicked",
		"kilo-code.new.openInTab",
		"kilo-code.new.showChanges",
		"kilo-code.new.openMigrationWizard",
		"kilo-code.new.autocomplete.generateSuggestions",
		"kilo-code.new.autocomplete.cancelSuggestions",
		"kilo-code.new.autocomplete.nextEdit.acceptOrJump",
		"kilo-code.new.autocomplete.nextEdit.dismiss",
		"kilo-code.new.agentManager.previousSession",
		"kilo-code.new.agentManager.nextSession",
		"kilo-code.new.agentManager.previousTab",
		"kilo-code.new.agentManager.nextTab",
		"kilo-code.new.agentManager.search",
		"kilo-code.new.agentManager.showTerminal",
		"kilo-code.new.agentManager.runScript",
		"kilo-code.new.agentManager.toggleDiff",
		"kilo-code.new.agentManager.showShortcuts",
		"kilo-code.new.agentManager.newTab",
		"kilo-code.new.agentManager.newTerminal",
		"kilo-code.new.agentManager.closeTab",
		"kilo-code.new.agentManager.newWorktree",
		"kilo-code.new.agentManager.openWorktree",
		"kilo-code.new.agentManager.openPR",
		"kilo-code.new.agentManager.closeWorktree",
		"kilo-code.new.agentManager.advancedWorktree",
		"kilo-code.new.agentManager.jumpTo1",
		"kilo-code.new.agentManager.jumpTo2",
		"kilo-code.new.agentManager.jumpTo3",
		"kilo-code.new.agentManager.jumpTo4",
		"kilo-code.new.agentManager.jumpTo5",
		"kilo-code.new.agentManager.jumpTo6",
		"kilo-code.new.agentManager.jumpTo7",
		"kilo-code.new.agentManager.jumpTo8",
		"kilo-code.new.agentManager.jumpTo9",
		"kilo-code.new.generateCommitMessage",
		"kilo-code.new.explainCode",
		"kilo-code.new.fixCode",
		"kilo-code.new.improveCode",
		"kilo-code.new.addToContext",
		"kilo-code.new.terminalAddToContext",
		"kilo-code.new.terminalFixCommand",
		"kilo-code.new.terminalExplainCommand",
		"kilo-code.new.focusChatInput",
		"kilo-code.new.cycleAgentMode",
		"kilo-code.new.cyclePreviousAgentMode",
		"kilo-code.new.toggleAutoApprove",
		"kilo-code.new.generateTerminalCommand",
		"kilo-code.new.takeHeapSnapshot",
	]
	const missing = kiloCommands.filter((id) => !existing.includes(id))
	const addedCommands = missing.map((id) => ({ command: id, title: `Kilo Code: ${id}` }))
	if (!pkg.contributes) pkg.contributes = {}
	if (!pkg.contributes.commands) pkg.contributes.commands = []
	pkg.contributes.commands.push(...addedCommands)
	await safeWriteJson(pkgPath, pkg, { prettyPrint: false })
	console.log(JSON.stringify({ addedCommands }))
})()
