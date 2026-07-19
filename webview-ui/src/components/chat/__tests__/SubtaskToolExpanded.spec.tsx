import React from "react"
import { render, screen, fireEvent, waitFor } from "@/utils/test-utils"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SubtaskToolExpanded, extractTaskResult, isTaskRunning } from "../SubtaskToolExpanded"
import type { ClineSayTool, ClineMessage, HistoryItem } from "@ali-code/types"
import { CollapsibleSection } from "../CollapsibleSection"

// Mock vscode API
const mockPostMessage = vi.fn()
vi.mock("@src/utils/vscode", () => ({
	vscode: {
		postMessage: (msg: unknown) => mockPostMessage(msg),
	},
}))

// Mock i18n
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string, options?: { mode?: string }) => {
			const map: Record<string, string> = {
				"chat:subtasks.wantsToCreate": "Roo wants to create a new subtask",
				"chat:subtasks.resultContent": "Task result",
				"chat:subtasks.goToSubtask": "Go to subtask",
				"chat:subtasks.openInTab": "Open in tab",
				"chat:subtasks.taskStarting": "Task starting...",
				"chat:subtasks.childTaskSummary": "Child Task Summary",
				"chat:subtasks.modeLabel": "Mode",
				"chat:subtasks.tokensLabel": "Tokens",
			}
			if (options?.mode) {
				return map[key]?.replace("{mode}", options.mode) ?? key
			}
			return map[key] ?? key
		},
		i18n: { exists: () => true },
	}),
	Trans: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
	initReactI18next: { type: "3rdParty", init: () => {} },
}))

// Mock ExtensionStateContext
let mockTaskHistory: HistoryItem[] = []
let mockClineMessages: ClineMessage[] = []
let mockCurrentTaskItem: Partial<HistoryItem> | undefined = undefined

vi.mock("@src/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		taskHistory: mockTaskHistory,
		clineMessages: mockClineMessages,
		currentTaskItem: mockCurrentTaskItem,
		mcpServers: [],
		alwaysAllowMcp: false,
		currentCheckpoint: null,
		mode: "code",
		apiConfiguration: {},
	}),
}))

// Mock useSelectedModel hook
vi.mock("@src/components/ui/hooks/useSelectedModel", () => ({
	useSelectedModel: () => ({ info: { supportsImages: true } }),
}))

// Mock MarkdownBlock to avoid pulling in heavy dependencies
vi.mock("../../common/MarkdownBlock", () => ({
	__esModule: true,
	default: ({ markdown }: { markdown?: string }) => <div data-testid="mock-markdown-block">{markdown}</div>,
}))

const queryClient = new QueryClient()

function renderSubtaskToolExpanded(
	props: Partial<{
		tool: ClineSayTool
		childTaskId: string
		clineMessages: ClineMessage[]
		currentTaskItem: HistoryItem
		isFollowedBySubtaskResult: boolean
	}> = {},
) {
	const defaultTool: ClineSayTool = {
		tool: "newTask",
		mode: "code",
		content: "Implement feature X",
	}

	const defaultProps = {
		tool: defaultTool,
		childTaskId: "child-task-123",
		clineMessages: mockClineMessages,
		currentTaskItem: mockCurrentTaskItem,
		isFollowedBySubtaskResult: false,
		...props,
	}

	return render(
		<QueryClientProvider client={queryClient}>
			<SubtaskToolExpanded {...defaultProps} />
		</QueryClientProvider>,
	)
}

function setupMocks(
	taskHistory: HistoryItem[] = [],
	clineMessages: ClineMessage[] = [],
	currentTaskItem: Partial<HistoryItem> = {},
) {
	mockTaskHistory = taskHistory
	mockClineMessages = clineMessages
	mockCurrentTaskItem = currentTaskItem
	mockPostMessage.mockClear()
}

/** Helper to expand the collapsible section by clicking the toggle button */
function expandSection() {
	const toggleButton = screen.getByRole("button", { name: /toggle/i })
	fireEvent.click(toggleButton)
}

/** Helper to get the collapsible section element */
function getCollapsibleSection() {
	return screen.getByTestId("collapsible-section")
}

/** Helper to check if the collapsible section is open (via data-state attribute) */
function expectOpen() {
	expect(getCollapsibleSection()).toHaveAttribute("data-state", "open")
}

/** Helper to check if the collapsible section is closed (via data-state attribute) */
function expectClosed() {
	expect(getCollapsibleSection()).toHaveAttribute("data-state", "closed")
}

describe("SubtaskToolExpanded", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockTaskHistory = []
		mockClineMessages = []
		mockCurrentTaskItem = {}
	})

	describe("extractTaskResult", () => {
		it("extracts content from <task_result> XML tags", () => {
			const input = "Some text <task_result>Extracted result</task_result> more text"
			expect(extractTaskResult(input)).toBe("Extracted result")
		})

		it("returns raw output when no <task_result> tags found", () => {
			const input = "Plain text result without tags"
			expect(extractTaskResult(input)).toBe("Plain text result without tags")
		})

		it("handles multiline content in <task_result> tags", () => {
			const input = "<task_result>\nLine 1\nLine 2\n</task_result>"
			expect(extractTaskResult(input)).toBe("Line 1\nLine 2")
		})

		it("returns undefined for undefined input", () => {
			expect(extractTaskResult(undefined)).toBeUndefined()
		})

		it("returns empty string for empty string", () => {
			expect(extractTaskResult("")).toBe("")
		})

		it("handles multiple <task_result> tags (returns first match)", () => {
			const input = "<task_result>First</task_result> <task_result>Second</task_result>"
			expect(extractTaskResult(input)).toBe("First")
		})
	})

	describe("isTaskRunning", () => {
		it("returns true for 'active' status", () => {
			expect(isTaskRunning("active")).toBe(true)
		})

		it("returns true for 'delegated' status", () => {
			expect(isTaskRunning("delegated")).toBe(true)
		})

		it("returns false for 'completed' status", () => {
			expect(isTaskRunning("completed")).toBe(false)
		})

		it("returns false for 'failed' status", () => {
			expect(isTaskRunning("failed")).toBe(false)
		})

		it("returns false for undefined status", () => {
			expect(isTaskRunning(undefined)).toBe(false)
		})

		it("returns false for empty string", () => {
			expect(isTaskRunning("")).toBe(false)
		})
	})

	describe("Auto-open for running tasks", () => {
		it("auto-expands when child task is running (active status)", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expectOpen()
		})

		it("auto-expands when child task is delegated", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "delegated",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expectOpen()
		})

		it("does NOT auto-expand when child task is completed", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expectClosed()
		})

		it("does NOT auto-expand when child task is failed", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "failed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expectClosed()
		})
	})

	describe("Starting... placeholder for running tasks", () => {
		it("shows 'Task starting...' when child task is running", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			// Auto-expanded for running tasks, so content should be visible
			expect(screen.getByText("Task starting...")).toBeInTheDocument()
		})

		it("shows loading spinner in header when running", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			// The Loader icon from lucide-react renders an SVG. Check for the animate-spin class.
			const headerDiv = screen.getByText("Roo wants to create a new subtask").closest("div")
			expect(headerDiv?.querySelector(".animate-spin")).toBeInTheDocument()
		})

		it("does NOT show 'Task starting...' for completed tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			// Expand the section first
			expandSection()

			expect(screen.queryByText("Task starting...")).not.toBeInTheDocument()
		})
	})

	describe("Task result extraction from <task_result> XML", () => {
		it("shows extracted result when subtask_result message exists", () => {
			setupMocks(
				[
					{
						id: "child-task-123",
						task: "Implement feature X",
						status: "completed",
						mode: "code",
						tokensIn: 100,
						tokensOut: 200,
					},
				],
				[
					{
						ts: Date.now(),
						type: "say",
						say: "subtask_result",
						text: "<task_result>Task completed successfully</task_result>",
					},
				],
				{ completedByChildId: "child-task-123" },
			)

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.getByText("Task result")).toBeInTheDocument()
			// The result text is rendered via MarkdownBlock mock, so it appears as plain text
			expect(screen.getByText("Task completed successfully")).toBeInTheDocument()
		})

		it("shows raw output when no <task_result> tags found", () => {
			setupMocks(
				[
					{
						id: "child-task-123",
						task: "Implement feature X",
						status: "completed",
						mode: "code",
						tokensIn: 100,
						tokensOut: 200,
					},
				],
				[{ ts: Date.now(), type: "say", say: "subtask_result", text: "Plain text result without tags" }],
				{ completedByChildId: "child-task-123" },
			)

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.getByText("Plain text result without tags")).toBeInTheDocument()
		})

		it("does not show result section when no subtask_result message", () => {
			setupMocks(
				[
					{
						id: "child-task-123",
						task: "Implement feature X",
						status: "completed",
						mode: "code",
						tokensIn: 100,
						tokensOut: 200,
					},
				],
				[],
				{ completedByChildId: "child-task-123" },
			)

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.queryByText("Task result")).not.toBeInTheDocument()
		})

		it("does not show result for running tasks", () => {
			setupMocks(
				[
					{
						id: "child-task-123",
						task: "Implement feature X",
						status: "active",
						mode: "code",
						tokensIn: 100,
						tokensOut: 200,
					},
				],
				[
					{
						ts: Date.now(),
						type: "say",
						say: "subtask_result",
						text: "<task_result>Should not show</task_result>",
					},
				],
				{ completedByChildId: "child-task-123" },
			)

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			// Auto-expanded for running tasks
			expect(screen.queryByText("Task result")).not.toBeInTheDocument()
		})
	})

	describe("Open in tab button", () => {
		it("shows 'Open in tab' button when childTaskId exists", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.getByText("Open in tab")).toBeInTheDocument()
		})

		it("sends openSubAgentViewer message when 'Open in tab' clicked", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({
				childTaskId: "child-task-123",
				tool: { tool: "newTask", mode: "code", content: "Implement feature X" },
			})

			expandSection()

			const openInTabButton = screen.getByText("Open in tab")
			fireEvent.click(openInTabButton)

			expect(mockPostMessage).toHaveBeenCalledWith({
				type: "openSubAgentViewer",
				sessionID: "child-task-123",
				title: "Implement feature X",
			})
		})

		it("does not show 'Open in tab' when childTaskId is missing", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: undefined })

			expandSection()

			expect(screen.queryByText("Open in tab")).not.toBeInTheDocument()
		})
	})

	describe("Go to subtask button", () => {
		it("shows 'Go to subtask' when childTaskId exists and not followed by subtask_result", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123", isFollowedBySubtaskResult: false })

			// Auto-expanded for running tasks
			expect(screen.getByText("Go to subtask")).toBeInTheDocument()
		})

		it("sends showTaskWithId message when 'Go to subtask' clicked", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123", isFollowedBySubtaskResult: false })

			const goToSubtaskButton = screen.getByText("Go to subtask")
			fireEvent.click(goToSubtaskButton)

			expect(mockPostMessage).toHaveBeenCalledWith({
				type: "showTaskWithId",
				text: "child-task-123",
			})
		})

		it("does NOT show 'Go to subtask' when isFollowedBySubtaskResult is true", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123", isFollowedBySubtaskResult: true })

			expandSection()

			expect(screen.queryByText("Go to subtask")).not.toBeInTheDocument()
		})
	})

	describe("Child task summary display", () => {
		it("shows child task summary for completed tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.getByText("Child Task Summary")).toBeInTheDocument()
			// "Implement feature X" appears both in the markdown block and the child summary
			expect(screen.getAllByText("Implement feature X").length).toBeGreaterThanOrEqual(1)
			expect(screen.getByText("Mode: code")).toBeInTheDocument()
			expect(screen.getByText("Tokens: 100 / 200")).toBeInTheDocument()
		})

		it("shows mode in child task summary", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Design architecture",
					status: "completed",
					mode: "architect",
					tokensIn: 500,
					tokensOut: 1000,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.getByText("Mode: architect")).toBeInTheDocument()
		})

		it("does NOT show child task summary for running tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			// Auto-expanded for running tasks
			expect(screen.queryByText("Child Task Summary")).not.toBeInTheDocument()
		})

		it("does NOT show child task summary when childHistoryItem not found", () => {
			setupMocks([]) // Empty task history

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expect(screen.queryByText("Child Task Summary")).not.toBeInTheDocument()
		})
	})

	describe("Deferred loading (collapsed by default for completed tasks)", () => {
		it("starts collapsed for completed tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expectClosed()
		})

		it("starts collapsed for failed tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "failed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expectClosed()
		})

		it("can be manually expanded by clicking toggle", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			expandSection()

			expectOpen()
		})

		it("can be manually collapsed after expanding", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			const toggleButton = screen.getByRole("button", { name: /toggle/i })
			fireEvent.click(toggleButton) // Expand
			fireEvent.click(toggleButton) // Collapse

			expectClosed()
		})

		it("remembers user's expanded state (doesn't auto-collapse running task after user collapses)", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			const { rerender } = renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			// Initially auto-expanded
			expectOpen()

			// User manually collapses
			const toggleButton = screen.getByRole("button", { name: /toggle/i })
			fireEvent.click(toggleButton)

			expectClosed()

			// Re-render with same props (simulating parent re-render)
			const defaultTool: ClineSayTool = {
				tool: "newTask",
				mode: "code",
				content: "Implement feature X",
			}
			rerender(
				<QueryClientProvider client={queryClient}>
					<SubtaskToolExpanded
						tool={defaultTool}
						childTaskId="child-task-123"
						clineMessages={mockClineMessages}
						currentTaskItem={mockCurrentTaskItem}
						isFollowedBySubtaskResult={false}
					/>
				</QueryClientProvider>,
			)

			// Should stay collapsed (user preference remembered)
			expectClosed()
		})
	})

	describe("Task description rendering", () => {
		it("renders task description as markdown", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({
				childTaskId: "child-task-123",
				tool: { tool: "newTask", mode: "code", content: "**Bold** and *italic* text" },
			})

			expandSection()

			// The MarkdownBlock mock renders the raw markdown string
			const mockBlock = screen.getByTestId("mock-markdown-block")
			expect(mockBlock).toHaveTextContent("**Bold** and *italic* text")
		})
	})

	describe("Header styling", () => {
		it("shows green border for running tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "active",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			const collapsibleSection = getCollapsibleSection()
			expect(collapsibleSection).toHaveClass("border-l-2")
			expect(collapsibleSection).toHaveClass("border-l-vscode-charts-green")
		})

		it("does not show green border for completed tasks", () => {
			setupMocks([
				{
					id: "child-task-123",
					task: "Implement feature X",
					status: "completed",
					mode: "code",
					tokensIn: 100,
					tokensOut: 200,
				},
			])

			renderSubtaskToolExpanded({ childTaskId: "child-task-123" })

			const collapsibleSection = getCollapsibleSection()
			expect(collapsibleSection).not.toHaveClass("border-l-vscode-charts-green")
		})
	})
})
