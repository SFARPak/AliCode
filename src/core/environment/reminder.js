"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.formatReminderSection = formatReminderSection
/**
 * Format the reminders section as a markdown block in English, with basic instructions.
 */
function formatReminderSection(todoList) {
	if (!todoList || todoList.length === 0) {
		return "You have not created a todo list yet. Create one with `update_todo_list` if your task is complicated or involves multiple steps."
	}
	const statusMap = {
		pending: "Pending",
		in_progress: "In Progress",
		completed: "Completed",
	}
	const lines = [
		"====",
		"",
		"REMINDERS",
		"",
		"Below is your current list of reminders for this task. Keep them updated as you progress.",
		"",
	]
	lines.push("| # | Content | Status |")
	lines.push("|---|---------|--------|")
	todoList.forEach((item, idx) => {
		const escapedContent = item.content.replace(/\\/g, "\\\\").replace(/\|/g, "\\|")
		lines.push(`| ${idx + 1} | ${escapedContent} | ${statusMap[item.status] || item.status} |`)
	})
	lines.push("")
	lines.push(
		"",
		"IMPORTANT: When task status changes, remember to call the `update_todo_list` tool to update your progress.",
		"",
	)
	return lines.join("\n")
}
