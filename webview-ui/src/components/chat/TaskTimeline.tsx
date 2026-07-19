/**
 * Horizontal session activity timeline rendered as color-grouped SVG paths.
 * Pointer and keyboard interaction use the same pure bar geometry.
 *
 * Ported from kilocode_tmp (SolidJS) to React + Tailwind CSS.
 */

import { memo, useRef, useState, useMemo, useCallback, useEffect } from "react"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { cn } from "@src/lib/utils"
import type { ClineMessage } from "@ali-code/types"

// ── Constants ────────────────────────────────────────────────────────

const MAX_HEIGHT = 26
const BAR_W = 12
const MIN_H = 8
const PAD = 4
const GAP = 1

// ── Color palette (VS Code CSS variables) ────────────────────────────

const palette = {
	user: "var(--tl-user, color-mix(in srgb, var(--vscode-editor-findMatchBackground) 50%, var(--vscode-errorForeground)))",
	read: "var(--tl-read, var(--vscode-textLink-foreground))",
	write: "var(--tl-write, var(--vscode-focusBorder))",
	tool: "var(--tl-tool, var(--vscode-activityBarBadge-background))",
	success: "var(--tl-success, var(--vscode-editorGutter-addedBackground))",
	error: "var(--tl-error, var(--vscode-errorForeground))",
	text: "var(--tl-text, var(--vscode-descriptionForeground))",
	reasoning: "var(--tl-reasoning, var(--vscode-descriptionForeground))",
	step: "var(--tl-step, var(--vscode-badge-background))",
	fallback: "var(--tl-fallback, var(--vscode-badge-background))",
} as const

// ── File operation detection ─────────────────────────────────────────

const READ_TOOLS = new Set([
	"readFile",
	"listFilesTopLevel",
	"listFilesRecursive",
	"searchFiles",
	"codebaseSearch",
	"readCommandOutput",
])

const WRITE_TOOLS = new Set([
	"editedExistingFile",
	"appliedDiff",
	"newFileCreated",
	"generateImage",
	"imageGenerated",
])

// ── Types ─────────────────────────────────────────────────────────────

export interface TimelineBar {
	bg: string
	tip: string
	width: number
	height: number
	idx: number
}

interface TimelineGeometryItem extends TimelineBar {
	x: number
}

interface TimelineGeometry {
	items: TimelineGeometryItem[]
	paths: Array<{ bg: string; d: string }>
	width: number
}

export interface TaskTimelineProps {
	/** The messages to visualize as a timeline */
	messages: ClineMessage[]
	/** Whether the task is currently running (shows pulsing animation on last bar) */
	isBusy?: boolean
	/** Callback when a bar is clicked/activated via keyboard */
	onBarSelect?: (index: number) => void
}

// ── Helpers ───────────────────────────────────────────────────────────

function getColor(msg: ClineMessage): string {
	const say = msg.say

	if (say === "text") return palette.text
	if (say === "reasoning") return palette.reasoning
	if (say === "error" || say === "diff_error" || say === "condense_context_error") return palette.error
	if (say === "completion_result") return palette.success
	if (say === "api_req_started" || say === "api_req_finished" || say === "api_req_retried" || say === "api_req_retry_delayed" || say === "api_req_rate_limit_wait" || say === "api_req_deleted") return palette.step

	// Tool messages (say is a tool name)
	if (msg.type === "say" && msg.say && typeof msg.say === "string") {
		const toolName = msg.say
		if (READ_TOOLS.has(toolName)) return palette.read
		if (WRITE_TOOLS.has(toolName)) return palette.write
		return palette.tool
	}

	// Ask messages
	if (msg.type === "ask") return palette.user

	return palette.fallback
}

function getLabel(msg: ClineMessage): string {
	const say = msg.say

	if (say === "text") return "Text"
	if (say === "reasoning") return "Reasoning"
	if (say === "error") return "Error"
	if (say === "completion_result") return "Completed"
	if (say === "api_req_started") return "API Request"
	if (say === "api_req_finished") return "API Done"
	if (say === "api_req_retried") return "API Retry"
	if (say === "api_req_retry_delayed") return "API Retry Delayed"
	if (say === "api_req_rate_limit_wait") return "Rate Limit Wait"
	if (say === "api_req_deleted") return "API Cancelled"
	if (say === "diff_error") return "Diff Error"
	if (say === "condense_context_error") return "Condense Error"
	if (say === "command_output") return "Command Output"
	if (say === "shell_integration_warning") return "Shell Warning"
	if (say === "mcp_server_request_started") return "MCP Request"
	if (say === "mcp_server_response") return "MCP Response"
	if (say === "subtask_result") return "Subtask Result"
	if (say === "checkpoint_saved") return "Checkpoint"
	if (say === "rooignore_error") return "RooIgnore Error"
	if (say === "condense_context") return "Condensing"
	if (say === "codebase_search_result") return "Search Result"
	if (say === "too_many_tools_warning") return "Tools Warning"
	if (say === "user_feedback") return "Feedback"
	if (say === "user_feedback_diff") return "Feedback Diff"
	if (say === "image") return "Image"

	// Tool messages
	if (msg.type === "say" && msg.say && typeof msg.say === "string") {
		return msg.say
	}

	// Ask messages
	if (msg.type === "ask" && msg.ask) {
		return msg.ask
	}

	return "Unknown"
}

function getContentLength(msg: ClineMessage): number {
	const textLen = msg.text?.length ?? 0
	const reasoningLen = msg.reasoning?.length ?? 0
	return Math.max(1, textLen + reasoningLen)
}

function collectBars(messages: ClineMessage[]): TimelineBar[] {
	const filtered = messages.filter((m) => {
		// Skip user messages and certain non-visual say types
		if (m.type === "ask" && m.ask === "tool" && !m.isAnswered) return false
		if (m.say === "api_req_started" || m.say === "api_req_finished" || m.say === "api_req_retried" || m.say === "api_req_retry_delayed" || m.say === "api_req_rate_limit_wait" || m.say === "api_req_deleted") return false
		return true
	})

	if (filtered.length === 0) return []

	const raw = filtered.map((m) => getContentLength(m))
	const max = Math.max(...raw)

	return filtered.map((msg, i) => {
		const cr = Math.min(1, raw[i]! / Math.max(1, max))
		return {
			bg: getColor(msg),
			tip: getLabel(msg),
			width: BAR_W,
			height: Math.round(MIN_H + cr * (MAX_HEIGHT - MIN_H - PAD)),
			idx: i,
		}
	})
}

function computeGeometry(bars: TimelineBar[]): TimelineGeometry {
	const paths = new Map<string, string[]>()
	const items: TimelineGeometryItem[] = []
	let x = 0

	for (const [idx, bar] of bars.entries()) {
		const item = { ...bar, idx, x }
		items.push(item)
		const path = paths.get(bar.bg) ?? []
		const y = MAX_HEIGHT - bar.height
		const radius = Math.min(2, bar.width / 2, bar.height)
		const d = `M${x},${MAX_HEIGHT}V${y + radius}Q${x},${y} ${x + radius},${y}H${x + bar.width - radius}Q${x + bar.width},${y} ${x + bar.width},${y + radius}V${MAX_HEIGHT}Z`
		path.push(d)
		paths.set(bar.bg, path)
		x += bar.width + GAP
	}

	return {
		items,
		paths: Array.from(paths, ([bg, parts]) => ({ bg, d: parts.join("") })),
		width: x,
	}
}

function hitTest(items: TimelineGeometryItem[], x: number): number {
	let low = 0
	let high = items.length - 1

	while (low <= high) {
		const mid = Math.floor((low + high) / 2)
		const item = items[mid]!
		if (x < item.x) {
			high = mid - 1
			continue
		}
		if (x >= item.x + item.width) {
			low = mid + 1
			continue
		}
		return item.idx
	}

	return -1
}

function navigateKey(index: number, count: number, key: string): number {
	if (count === 0) return -1
	if (key === "Home") return 0
	if (key === "End") return count - 1
	if (key === "ArrowLeft") return Math.max(0, index < 0 ? count - 1 : index - 1)
	if (key === "ArrowRight") return Math.min(count - 1, index < 0 ? 0 : index + 1)
	return index
}

function isPinned(el: HTMLDivElement, slack = BAR_W): boolean {
	return el.scrollWidth - el.clientWidth - el.scrollLeft <= slack
}

// ── Component ─────────────────────────────────────────────────────────

const TaskTimeline = memo(({ messages, isBusy = false, onBarSelect }: TaskTimelineProps) => {
	const { t } = useAppTranslation()
	const containerRef = useRef<HTMLDivElement>(null)
	const dragging = useRef(false)
	const startX = useRef(0)
	const startScroll = useRef(0)
	const follow = useRef(true)
	const rafId = useRef<number | undefined>(undefined)

	const [hoverIdx, setHoverIdx] = useState(-1)
	const [activeIdx, setActiveIdx] = useState(-1)
	const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

	const bars = useMemo(() => collectBars(messages), [messages])
	const geometry = useMemo(() => computeGeometry(bars), [bars])

	const selectedIdx = activeIdx >= 0 && activeIdx < bars.length ? activeIdx : bars.length - 1

	const ariaLabel = useMemo(() => {
		const idx = selectedIdx
		const bar = bars[idx]
		if (!bar) return t("chat:timeline.noActivity")
		return t("chat:timeline.ariaLabel", { index: idx + 1, total: bars.length, label: bar.tip })
	}, [bars, selectedIdx, t])

	// Auto-scroll to end when new bars appear and we're following
	const prevLen = useRef(bars.length)
	useEffect(() => {
		const len = bars.length
		if (len > prevLen.current && containerRef.current && follow.current && rafId.current === undefined) {
			rafId.current = requestAnimationFrame(() => {
				rafId.current = undefined
				if (!containerRef.current || !follow.current) return
				containerRef.current.scrollLeft = containerRef.current.scrollWidth
			})
		}
		if (activeIdx >= len) setActiveIdx(len - 1)
		prevLen.current = len
	}, [bars.length, activeIdx])

	// Cleanup RAF on unmount
	useEffect(() => {
		return () => {
			if (rafId.current !== undefined) cancelAnimationFrame(rafId.current)
		}
	}, [])

	const hideTooltip = useCallback(() => {
		setHoverIdx(-1)
		setTooltip(null)
	}, [])

	// Hide tooltip when bars change
	useEffect(() => {
		hideTooltip()
	}, [bars, hideTooltip])

	const showTooltip = useCallback(
		(idx: number) => {
			const item = geometry.items[idx]
			const bar = bars[idx]
			const el = containerRef.current
			if (!el || !item || !bar) {
				hideTooltip()
				return
			}
			const rect = el.getBoundingClientRect()
			const margin = Math.min(160, window.innerWidth / 2)
			setHoverIdx(idx)
			setTooltip({
				text: bar.tip,
				x: Math.max(margin, Math.min(window.innerWidth - margin, rect.left + item.x - el.scrollLeft + item.width / 2)),
				y: rect.top + MAX_HEIGHT - item.height,
			})
		},
		[geometry.items, bars, hideTooltip],
	)

	const pointerIndex = useCallback(
		(e: React.PointerEvent) => {
			const el = containerRef.current
			if (!el) return -1
			const rect = el.getBoundingClientRect()
			return hitTest(geometry.items, e.clientX - rect.left + el.scrollLeft)
		},
		[geometry.items],
	)

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			hideTooltip()
			const el = containerRef.current
			if (!el) return
			dragging.current = true
			startX.current = e.clientX
			startScroll.current = el.scrollLeft
			el.setPointerCapture(e.pointerId)
			el.style.cursor = "grabbing"
			el.style.userSelect = "none"
		},
		[hideTooltip],
	)

	const onPointerMove = useCallback(
		(e: React.PointerEvent) => {
			const el = containerRef.current
			if (!el) return
			if (!dragging.current) {
				const idx = pointerIndex(e)
				if (idx === hoverIdx) return
				if (idx < 0) {
					hideTooltip()
					return
				}
				showTooltip(idx)
				return
			}
			el.scrollLeft = startScroll.current - (e.clientX - startX.current)
		},
		[pointerIndex, hoverIdx, hideTooltip, showTooltip],
	)

	const onPointerUp = useCallback((e: React.PointerEvent) => {
		const el = containerRef.current
		if (!el) return
		dragging.current = false
		if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
		el.style.cursor = "grab"
		el.style.userSelect = ""
	}, [])

	const onScroll = useCallback(() => {
		const el = containerRef.current
		if (el) follow.current = isPinned(el)
	}, [])

	const _onWheel = useCallback(
		(e: React.WheelEvent) => {
			hideTooltip()
			const el = containerRef.current
			if (!el) return
			e.preventDefault()
			el.scrollLeft += e.deltaY || e.deltaX
		},
		[hideTooltip],
	)

	const onKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const el = containerRef.current
			if (!el || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return
			e.preventDefault()
			const idx = navigateKey(selectedIdx, bars.length, e.key)
			setActiveIdx(idx)
			onBarSelect?.(idx)
			const item = geometry.items[idx]
			if (!item) return
			const left = item.x
			const right = item.x + item.width
			if (left < el.scrollLeft) el.scrollLeft = left
			if (right > el.scrollLeft + el.clientWidth) el.scrollLeft = right - el.clientWidth
			showTooltip(idx)
		},
		[selectedIdx, bars.length, geometry.items, onBarSelect, showTooltip],
	)

	const onBarClick = useCallback(
		(e: React.MouseEvent) => {
			const idx = pointerIndex(e as unknown as React.PointerEvent)
			if (idx >= 0) {
				setActiveIdx(idx)
				onBarSelect?.(idx)
			}
		},
		[pointerIndex, onBarSelect],
	)

	// Render overlay div for hover/active bar
	const renderOverlay = useCallback(
		(idx: number, pulse = false) => {
			const item = geometry.items[idx]
			if (!item) return null
			return (
				<div
					className={cn(
						"absolute top-0 rounded-sm pointer-events-none transition-opacity",
						pulse && "animate-pulse",
					)}
					style={{
						left: `${item.x}px`,
						width: `${item.width}px`,
						height: `${item.height}px`,
						backgroundColor: item.bg,
					}}
					aria-hidden="true"
				/>
			)
		},
		[geometry.items],
	)

	if (bars.length === 0) {
		return null
	}

	return (
		<>
			<div className="px-3 py-1">
				<div
					ref={containerRef}
					className="overflow-x-auto overflow-y-hidden cursor-grab rounded-md bg-vscode-sideBar-background/30"
					data-timeline-count={bars.length}
					role="img"
					tabIndex={0}
					aria-label={ariaLabel}
					style={{ height: `${MAX_HEIGHT}px` }}
					onKeyDown={onKeyDown}
					onBlur={hideTooltip}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
					onPointerLeave={hideTooltip}
					onScroll={onScroll}
					onClick={onBarClick}>
					<div
						className="relative"
						style={{ width: `${geometry.width}px`, height: `${MAX_HEIGHT}px` }}>
						<svg
							className="block"
							width={geometry.width}
							height={MAX_HEIGHT}
							viewBox={`0 0 ${geometry.width} ${MAX_HEIGHT}`}
							aria-hidden="true">
							{geometry.paths.map((path, i) => (
								<path key={i} d={path.d} fill={path.bg} />
							))}
						</svg>
						{hoverIdx >= 0 && renderOverlay(hoverIdx)}
						{isBusy && bars.length > 0 && renderOverlay(bars.length - 1, true)}
					</div>
				</div>
			</div>
			{tooltip && (
				<div
					className="fixed z-50 px-2 py-1 text-xs rounded-md bg-vscode-editorWidget-background text-vscode-editorWidget-foreground border border-vscode-editorWidget-border shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-1"
					role="tooltip"
					style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
					{tooltip.text}
				</div>
			)}
		</>
	)
})

TaskTimeline.displayName = "TaskTimeline"

export default TaskTimeline