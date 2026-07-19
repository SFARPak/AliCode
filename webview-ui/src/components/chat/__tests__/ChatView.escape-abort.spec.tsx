// npx vitest run src/components/chat/__tests__/ChatView.escape-abort.spec.tsx

import React from "react"
import { render, waitFor, fireEvent } from "@/utils/test-utils"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ExtensionStateContextProvider } from "@src/context/ExtensionStateContext"
import { vscode } from "@src/utils/vscode"

import ChatView, { ChatViewProps } from "../ChatView"

// Mock vscode API
vi.mock("@src/utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

// Mock use-sound hook
vi.mock("use-sound", () => ({
	default: vi.fn(() => [vi.fn()]),
}))

// Mock components
vi.mock("../ChatRow", () => ({
	default: function MockChatRow({ message }: { message: any }) {
		return <div data-testid="chat-row">{JSON.stringify(message)}</div>
	},
}))

vi.mock("../AutoApproveMenu", () => ({
	default: () => null,
}))

// Mock react-virtuoso to render items directly without virtualization
vi.mock("react-virtuoso", () => ({
	Virtuoso: function MockVirtuoso({
		data,
		itemContent,
	}: {
		data: any[]
		itemContent: (index: number, item: any) => React.ReactNode
	}) {
		return (
			<div data-testid="virtuoso-item-list">
				{data.map((item, index) => (
					<div key={item.ts} data-testid={`virtuoso-item-${index}`}>
						{itemContent(index, item)}
					</div>
				))}
			</div>
		)
	},
}))

// Mock VersionIndicator
vi.mock("../../common/VersionIndicator", () => ({
	default: vi.fn(() => null),
}))

vi.mock("../Announcement", () => ({
	default: function MockAnnouncement({ hideAnnouncement }: { hideAnnouncement: () => void }) {
		return (
			<div data-testid="announcement-modal">
				<div>What's New</div>
				<button onClick={hideAnnouncement}>Close</button>
			</div>
		)
	},
}))

vi.mock("@/components/common/DismissibleUpsell", () => ({
	default: function MockDismissibleUpsell({ children }: { children: React.ReactNode }) {
		return <div data-testid="dismissible-upsell">{children}</div>
	},
}))

vi.mock("../QueuedMessages", () => ({
	QueuedMessages: function MockQueuedMessages() {
		return null
	},
}))

vi.mock("@src/components/welcome/RooTips", () => ({
	default: function MockRooTips() {
		return <div data-testid="roo-tips">Tips content</div>
	},
}))

vi.mock("@src/components/welcome/RooHero", () => ({
	default: function MockRooHero() {
		return <div data-testid="roo-hero">Hero content</div>
	},
}))

// Mock i18n
vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
	initReactI18next: {
		type: "3rdParty",
		init: () => {},
	},
	Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}))

// Mock ChatTextArea
vi.mock("../ChatTextArea", () => {
	const ChatTextAreaComponent = React.forwardRef(function MockChatTextArea(
		_props: any,
		ref: React.ForwardedRef<{ focus: () => void }>,
	) {
		React.useImperativeHandle(ref, () => ({
			focus: vi.fn(),
		}))
		return <div data-testid="chat-textarea" />
	})

	return {
		default: ChatTextAreaComponent,
		ChatTextArea: ChatTextAreaComponent,
	}
})

// Mock VSCode components
vi.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
	VSCodeLink: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

// Mock window.postMessage to trigger state hydration
const mockPostMessage = (state: any) => {
	window.postMessage(
		{
			type: "state",
			state: {
				version: "1.0.0",
				clineMessages: [],
				taskHistory: [],
				shouldShowAnnouncement: false,
				allowedCommands: [],
				alwaysAllowExecute: false,
				cloudIsAuthenticated: false,
				mode: "code",
				customModes: [],
				...state,
			},
		},
		"*",
	)
}

const defaultProps: ChatViewProps = {
	isHidden: false,
	showAnnouncement: false,
	hideAnnouncement: () => {},
}

const queryClient = new QueryClient()

const renderChatView = (props: Partial<ChatViewProps> = {}) => {
	return render(
		<ExtensionStateContextProvider>
			<QueryClientProvider client={queryClient}>
				<ChatView {...defaultProps} {...props} />
			</QueryClientProvider>
		</ExtensionStateContextProvider>,
	)
}

describe("ChatView - Escape to Abort", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("does NOT send cancelTask when Escape is pressed and task is idle (no messages)", async () => {
		renderChatView()

		// Hydrate state with no messages (idle state)
		mockPostMessage({
			clineMessages: [],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Press Escape
		fireEvent.keyDown(window, { key: "Escape", code: "Escape" })

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify cancelTask was NOT sent
		const calls = (vscode.postMessage as any).mock.calls
		const cancelCall = calls.some((call: any[]) => call[0]?.type === "cancelTask")
		expect(cancelCall).toBe(false)
	})

	it("does NOT send cancelTask when Escape is pressed and task is idle (no streaming)", async () => {
		renderChatView()

		// Hydrate state with a completed task (not streaming)
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{ type: "ask", ask: "completion_result", ts: Date.now() - 1000, text: "Done", partial: false },
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Press Escape
		fireEvent.keyDown(window, { key: "Escape", code: "Escape" })

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify cancelTask was NOT sent
		const calls = (vscode.postMessage as any).mock.calls
		const cancelCall = calls.some((call: any[]) => call[0]?.type === "cancelTask")
		expect(cancelCall).toBe(false)
	})

	it("sends cancelTask when Escape is pressed during streaming (api_req_started without cost)", async () => {
		renderChatView()

		// Hydrate state with a task that has an active API request (streaming)
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "say",
					say: "api_req_started",
					ts: Date.now() - 500,
					text: JSON.stringify({}),
					partial: false,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Press Escape
		fireEvent.keyDown(window, { key: "Escape", code: "Escape" })

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify cancelTask was sent
		const calls = (vscode.postMessage as any).mock.calls
		const cancelCall = calls.some((call: any[]) => call[0]?.type === "cancelTask")
		expect(cancelCall).toBe(true)
	})

	it("sends cancelTask when Escape is pressed during streaming (partial message)", async () => {
		renderChatView()

		// Hydrate state with a task that has a partial message (streaming)
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "say",
					say: "text",
					ts: Date.now() - 500,
					text: "Working on it...",
					partial: true,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Press Escape
		fireEvent.keyDown(window, { key: "Escape", code: "Escape" })

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify cancelTask was sent
		const calls = (vscode.postMessage as any).mock.calls
		const cancelCall = calls.some((call: any[]) => call[0]?.type === "cancelTask")
		expect(cancelCall).toBe(true)
	})

	it("does NOT send cancelTask when Escape is pressed but event was already prevented (textarea handler)", async () => {
		renderChatView()

		// Hydrate state with a streaming task
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "say",
					say: "api_req_started",
					ts: Date.now() - 500,
					text: JSON.stringify({}),
					partial: false,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Create an event that has already been prevented (simulating textarea handler)
		const event = new KeyboardEvent("keydown", {
			key: "Escape",
			code: "Escape",
			bubbles: true,
			cancelable: true,
		})
		// Call preventDefault to simulate textarea already handling it
		event.preventDefault()

		window.dispatchEvent(event)

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify cancelTask was NOT sent (textarea handler already consumed the event)
		const calls = (vscode.postMessage as any).mock.calls
		const cancelCall = calls.some((call: any[]) => call[0]?.type === "cancelTask")
		expect(cancelCall).toBe(false)
	})

	it("calls preventDefault on the Escape event when aborting", async () => {
		renderChatView()

		// Hydrate state with a streaming task
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "say",
					say: "api_req_started",
					ts: Date.now() - 500,
					text: JSON.stringify({}),
					partial: false,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Create a keyboard event with preventDefault spy
		const event = new KeyboardEvent("keydown", {
			key: "Escape",
			code: "Escape",
			bubbles: true,
			cancelable: true,
		})

		const preventDefaultSpy = vi.spyOn(event, "preventDefault")

		window.dispatchEvent(event)

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify preventDefault was called
		expect(preventDefaultSpy).toHaveBeenCalled()
	})
})

describe("ChatView - New Task Quick Action Button", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("shows New Task button when a task exists and no primary/secondary buttons are visible", async () => {
		renderChatView()

		// Hydrate state with a streaming task (api_req_started without cost).
		// In this state, enableButtons is false and primaryButtonText is undefined,
		// so areButtonsVisible is false — the New Task quick action button should appear.
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "say",
					say: "api_req_started",
					ts: Date.now() - 500,
					text: JSON.stringify({}),
					partial: false,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))

		// The New Task button should be visible
		const newTaskButton = document.querySelector('[aria-label="chat:newTaskAction.title"]')
		expect(newTaskButton).not.toBeNull()
	})

	it("sends clearTask when New Task button is clicked", async () => {
		renderChatView()

		// Hydrate state with a streaming task (api_req_started without cost).
		// In this state, areButtonsVisible is false so the New Task quick action button appears.
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "say",
					say: "api_req_started",
					ts: Date.now() - 500,
					text: JSON.stringify({}),
					partial: false,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))
		vi.clearAllMocks()

		// Click the New Task button
		const newTaskButton = document.querySelector('[aria-label="chat:newTaskAction.title"]')
		expect(newTaskButton).not.toBeNull()
		fireEvent.click(newTaskButton!)

		await new Promise((resolve) => setTimeout(resolve, 50))

		// Verify clearTask was sent
		const calls = (vscode.postMessage as any).mock.calls
		const clearTaskCall = calls.some((call: any[]) => call[0]?.type === "clearTask")
		expect(clearTaskCall).toBe(true)
	})

	it("does NOT show New Task button when no task exists (home screen)", async () => {
		renderChatView()

		// Hydrate state with no messages (home screen)
		mockPostMessage({
			clineMessages: [],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))

		// The New Task button should NOT be visible
		const newTaskButton = document.querySelector('[aria-label="chat:newTaskAction.title"]')
		expect(newTaskButton).toBeNull()
	})

	it("does NOT show New Task button when primary/secondary buttons are visible", async () => {
		renderChatView()

		// Hydrate state with a task that has buttons visible (api_req_failed)
		mockPostMessage({
			clineMessages: [
				{ type: "say", say: "task", ts: Date.now() - 3000, text: "Initial task" },
				{
					type: "ask",
					ask: "api_req_failed",
					ts: Date.now() - 500,
					text: "API request failed",
					partial: false,
				},
			],
		})

		await new Promise((resolve) => setTimeout(resolve, 100))

		// The New Task button should NOT be visible (primary/secondary buttons take precedence)
		const newTaskButton = document.querySelector('[aria-label="chat:newTaskAction.title"]')
		expect(newTaskButton).toBeNull()
	})
})
