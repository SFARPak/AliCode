import React, { useCallback, useEffect, useMemo, useState } from "react"

import type { HistoryItem } from "@ali-code/types"
import { cn } from "@/lib/utils"
import { StandardTooltip, Button } from "@/components/ui"
import { vscode } from "@/utils/vscode"
import { useAppTranslation } from "@src/i18n/TranslationContext"

const MAX_SESSION_TABS = 12

interface GitStatus {
	added: number
	deleted: number
	modified: number
	renamed: number
	copied: number
	untracked: number
	unknown: number
	staged: number
}

interface SessionTabBarProps {
	taskHistory: HistoryItem[]
	currentTaskId: string | undefined
	gitStatus?: GitStatus
	onTabClick: (taskId: string) => void
	onNewSession: () => void
	onCloseTab: (taskId: string) => void
}

const SessionTabBar = ({
	taskHistory,
	currentTaskId,
	gitStatus,
	onTabClick,
	onNewSession,
	onCloseTab,
}: SessionTabBarProps) => {
	const { t } = useAppTranslation()
	const [isDragOver, setIsDragOver] = useState(false)

	useEffect(() => {
		vscode.postMessage({ type: "getGitStatus" })
	}, [])

	const recentSessions = useMemo(() => {
		const sorted = [...taskHistory].sort((a, b) => b.ts - a.ts)
		return sorted.slice(0, MAX_SESSION_TABS)
	}, [taskHistory])

	const handleCloseClick = useCallback(
		(e: React.MouseEvent, taskId: string) => {
			e.stopPropagation()
			onCloseTab(taskId)
		},
		[onCloseTab],
	)

	return (
		<div
			className={cn(
				"flex items-center gap-1 px-2 border-b border-vscode-panel-border bg-vscode-sideBar-background",
				isDragOver && "border-dashed border-vscode-focusBorder",
			)}
			onDragOver={(e) => {
				e.preventDefault()
				setIsDragOver(true)
			}}
			onDragLeave={() => setIsDragOver(false)}>
			{recentSessions.map((session) => {
				const isActive = session.id === currentTaskId
				return (
					<div
						key={session.id}
						role="tab"
						aria-selected={isActive}
						className={cn(
							"group flex items-center gap-1 px-3 py-1.5 text-xs rounded-t cursor-pointer transition-colors",
							"border-b-2 max-w-[200px]",
							isActive
								? "border-vscode-focusBorder bg-vscode-editor-background text-vscode-editor-foreground"
								: "border-transparent text-vscode-descriptionForeground hover:text-vscode-editor-foreground hover:bg-vscode-toolbar-hoverBackground",
						)}
						onClick={() => onTabClick(session.id)}
						title={session.task || `Session ${session.number}`}>
						<span className="truncate">{session.task || `Session ${session.number}`}</span>
						{isActive && session.status === "active" && (
							<span className="codicon codicon-loading codicon-modifier-spin text-[10px] ml-1" />
						)}
						<button
							className={cn(
								"codicon codicon-close ml-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity",
								"hover:bg-vscode-toolbar-hoverBackground rounded-sm",
							)}
							onClick={(e) => handleCloseClick(e, session.id)}
							title={t("chat:sessionTab.close") || "Close session"}></button>
					</div>
				)
			})}
			{gitStatus && (
				<div className="flex items-center gap-2 px-2 text-[11px] text-vscode-descriptionForeground border-l border-vscode-panel-border ml-1">
					{gitStatus.added > 0 && <span className="text-green-500">+{gitStatus.added}</span>}
					{gitStatus.deleted > 0 && <span className="text-red-500">-{gitStatus.deleted}</span>}
					{gitStatus.modified > 0 && <span className="text-yellow-500">~{gitStatus.modified}</span>}
					{gitStatus.untracked > 0 && (
						<span className="text-vscode-descriptionForeground">?{gitStatus.untracked}</span>
					)}
				</div>
			)}
			<div className="flex-1" />
			<StandardTooltip content={t("chat:sessionTab.newSession") || "New session"}>
				<Button
					variant="ghost"
					size="icon"
					className="ml-1"
					onClick={onNewSession}
					aria-label={t("chat:sessionTab.newSession") || "New session"}>
					<span className="codicon codicon-add text-xs"></span>
				</Button>
			</StandardTooltip>
		</div>
	)
}

export default SessionTabBar
