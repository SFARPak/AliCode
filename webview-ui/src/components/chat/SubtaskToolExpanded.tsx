/**
 * SubtaskToolExpanded component
 *
 * Rich rendering for the "newTask" tool in ChatRow. Provides:
 * - Auto-open for running subtasks
 * - Deferred loading for completed subtasks
 * - "Starting..." placeholder when running but no child tools yet
 * - Task result extraction from <task_result> XML tags
 * - "Open in tab" button to view the sub-agent in a separate viewer
 * - Child tool summary list (when data is available from the backend)
 *
 * Note: Full child tool listing requires backend support to stream child
 * session tool parts to the frontend. Currently the frontend only has access
 * to HistoryItem metadata (task description, mode, status, childIds).
 */

import React, { useMemo, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { SquareArrowOutUpRight, Split, Loader } from "lucide-react"

import type { ClineSayTool, ClineMessage } from "@ali-code/types"
import type { HistoryItem } from "@ali-code/types"

import { useExtensionState } from "@src/context/ExtensionStateContext"
import { vscode } from "@src/utils/vscode"

import MarkdownBlock from "../common/MarkdownBlock"
import { CollapsibleSection } from "./CollapsibleSection"

/**
 * Extract the task result from a subtask's output text.
 * Looks for <task_result>...</task_result> XML tags and returns the inner content.
 * Falls back to the raw output if no tags are found.
 */
export function extractTaskResult(output: string | undefined): string | undefined {
	if (output === undefined || output === null) return undefined
	if (typeof output !== "string") return undefined
	if (output === "") return ""
	const match = /<task_result>\s*([\s\S]*?)\s*<\/task_result>/.exec(output)
	return match?.[1] ?? output
}

/**
 * Determine if a subtask is currently running based on its HistoryItem status.
 */
export function isTaskRunning(status: string | undefined): boolean {
	return status === "active" || status === "delegated"
}

export interface SubtaskToolExpandedProps {
	/** The parsed tool data from the newTask message */
	tool: ClineSayTool
	/** The child task ID (from currentTaskItem.childIds) */
	childTaskId?: string
	/** All ClineMessages for the current task (to find subtask_result messages) */
	clineMessages: ClineMessage[]
	/** The current task's HistoryItem */
	currentTaskItem?: HistoryItem
	/** Whether this newTask is followed immediately by a subtask_result */
	isFollowedBySubtaskResult: boolean
}

/**
 * Find the HistoryItem for a child task from taskHistory.
 */
function findChildHistoryItem(taskHistory: HistoryItem[], childTaskId: string): HistoryItem | undefined {
	return taskHistory.find((item) => item.id === childTaskId)
}

/**
 * Find the subtask_result message that corresponds to this child task.
 * The subtask_result is a "say" message that appears after the child task completes.
 */
function findSubtaskResultMessage(
	clineMessages: ClineMessage[],
	currentTaskItem: HistoryItem | undefined,
): ClineMessage | undefined {
	if (!currentTaskItem?.completedByChildId) return undefined

	// Find the subtask_result say message
	return clineMessages.find((msg) => msg.type === "say" && msg.say === "subtask_result")
}

export const SubtaskToolExpanded: React.FC<SubtaskToolExpandedProps> = ({
	tool,
	childTaskId,
	clineMessages,
	currentTaskItem,
	isFollowedBySubtaskResult,
}) => {
	const { t } = useTranslation()
	const { taskHistory } = useExtensionState()

	// Find the child's HistoryItem from taskHistory
	const childHistoryItem = useMemo(() => {
		if (!childTaskId) return undefined
		return findChildHistoryItem(taskHistory, childTaskId)
	}, [childTaskId, taskHistory])

	// Determine if the child task is running
	const running = useMemo(() => {
		return isTaskRunning(childHistoryItem?.status)
	}, [childHistoryItem?.status])

	// Auto-open for running tasks, manual toggle for completed
	// Uses controlled mode when user has interacted, uncontrolled otherwise
	const [userExpanded, setUserExpanded] = useState<boolean | undefined>(undefined)
	const isExpanded = userExpanded !== undefined ? userExpanded : running

	const handleOpenChange = useCallback((open: boolean) => {
		setUserExpanded(open)
	}, [])

	// Find the subtask_result message for completed tasks
	const subtaskResultMessage = useMemo(() => {
		if (running) return undefined
		return findSubtaskResultMessage(clineMessages, currentTaskItem)
	}, [running, clineMessages, currentTaskItem])

	// Extract clean result text from the subtask_result message
	const resultText = useMemo(() => {
		return extractTaskResult(subtaskResultMessage?.text)
	}, [subtaskResultMessage?.text])

	// Build the header style matching ChatRow's headerStyle pattern
	const headerContent = (
		<div className="flex items-center gap-[10px] cursor-default mb-[10px] break-word">
			<Split className="size-4 shrink-0" />
			<span className="font-bold">{t("chat:subtasks.wantsToCreate", { mode: tool.mode || "code" })}</span>
			{running && (
				<span className="ml-1">
					<Loader className="size-3 animate-spin inline" />
				</span>
			)}
		</div>
	)

	// "Open in tab" button handler
	const handleOpenInTab = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation()
			if (!childTaskId) return
			vscode.postMessage({
				type: "openSubAgentViewer",
				sessionID: childTaskId,
				title: tool.content || childHistoryItem?.task,
			})
		},
		[childTaskId, tool.content, childHistoryItem?.task],
	)

	// "Go to subtask" handler
	const handleGoToSubtask = useCallback(() => {
		if (!childTaskId) return
		vscode.postMessage({ type: "showTaskWithId", text: childTaskId })
	}, [childTaskId])

	return (
		<CollapsibleSection
			title={headerContent}
			className={running ? "border-l-2 border-l-vscode-charts-green pl-2" : undefined}
			open={isExpanded}
			onOpenChange={handleOpenChange}>
			{/* Task description */}
			<div className="mb-3">
				<MarkdownBlock markdown={tool.content} />
			</div>

			{/* Running state: show "Starting..." if no child tools yet */}
			{running && (
				<div className="text-sm text-vscode-descriptionForeground italic mb-2">
					{t("chat:subtasks.taskStarting")}
				</div>
			)}

			{/* Completed state: show extracted result */}
			{!running && resultText && (
				<div className="mb-3">
					<div className="text-xs font-semibold text-vscode-descriptionForeground mb-1">
						{t("chat:subtasks.resultContent")}
					</div>
					<MarkdownBlock markdown={resultText} />
				</div>
			)}

			{/* Child tool summary list — placeholder for future backend support */}
			{childHistoryItem && !running && (
				<div className="mb-3">
					<div className="text-xs font-semibold text-vscode-descriptionForeground mb-1">
						{t("chat:subtasks.childTaskSummary")}
					</div>
					<div className="text-sm text-vscode-descriptionForeground bg-vscode-editorWidget-background rounded p-2">
						<div className="flex items-center gap-2">
							<span className="font-medium">{childHistoryItem.task}</span>
						</div>
						{childHistoryItem.mode && (
							<div className="text-xs text-vscode-descriptionForeground mt-1">
								{t("chat:subtasks.modeLabel")}: {childHistoryItem.mode}
							</div>
						)}
						<div className="text-xs text-vscode-descriptionForeground mt-1">
							{t("chat:subtasks.tokensLabel")}: {childHistoryItem.tokensIn} / {childHistoryItem.tokensOut}
						</div>
					</div>
				</div>
			)}

			{/* Action buttons */}
			<div className="flex gap-2 items-center mt-2">
				{childTaskId && !isFollowedBySubtaskResult && (
					<button
						type="button"
						className="cursor-pointer flex gap-1 items-center text-vscode-descriptionForeground hover:text-vscode-descriptionForeground hover:underline font-normal text-sm"
						onClick={handleGoToSubtask}>
						{t("chat:subtasks.goToSubtask")}
						<SquareArrowOutUpRight className="size-3" />
					</button>
				)}

				{childTaskId && (
					<button
						type="button"
						className="cursor-pointer flex gap-1 items-center text-vscode-descriptionForeground hover:text-vscode-descriptionForeground hover:underline font-normal text-sm"
						onClick={handleOpenInTab}
						aria-label={t("chat:subtasks.openInTab")}>
						{t("chat:subtasks.openInTab")}
						<SquareArrowOutUpRight className="size-3" />
					</button>
				)}
			</div>
		</CollapsibleSection>
	)
}

export default SubtaskToolExpanded
