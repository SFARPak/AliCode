// npx vitest src/components/chat/__tests__/TaskTimeline.spec.tsx

import React from "react"
import { render, fireEvent } from "@/utils/test-utils"
import type { ClineMessage } from "@ali-code/types"

import TaskTimeline from "../TaskTimeline"

// Mock i18n
vi.mock("@src/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string, options?: Record<string, unknown>) => {
			if (key === "chat:timeline.noActivity") return "Session activity timeline, no activity"
			if (key === "chat:timeline.ariaLabel") {
				const { index, total, label } = options ?? {}
				return `Session activity timeline, bar ${index} of ${total}: ${label}`
			}
			return key
		},
	}),
}))

// ── Helpers ───────────────────────────────────────────────────────────

function makeMsg(overrides: Partial<ClineMessage> = {}): ClineMessage {
	return {
		ts: Date.now(),
		type: "say",
		say: "text",
		text: "Hello world",
		...overrides,
	} as ClineMessage
}

function makeMessages(count: number, overrides?: Partial<ClineMessage>): ClineMessage[] {
	return Array.from({ length: count }, (_, i) =>
		makeMsg({ ts: 1000 + i * 100, text: `Message ${i + 1}`, ...overrides }),
	)
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("TaskTimeline", () => {
	it("renders nothing when messages array is empty", () => {
		const { container } = render(<TaskTimeline messages={[]} />)
		expect(container.firstChild).toBeNull()
	})

	it("renders colored bars for tool calls", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "Some text response" }),
			makeMsg({ type: "say", say: "readFile", text: '{"path": "/foo"}' }),
			makeMsg({ type: "say", say: "editedExistingFile", text: '{"path": "/bar"}' }),
			makeMsg({ type: "say", say: "codebaseSearch", text: '{"query": "test"}' }),
		]

		render(<TaskTimeline messages={messages} />)

		// Should render the SVG
		const svg = document.querySelector("svg")
		expect(svg).toBeTruthy()

		// Should have path elements (colored bars)
		const paths = svg!.querySelectorAll("path")
		expect(paths.length).toBeGreaterThan(0)

		// Each path should have a fill color
		paths.forEach((path) => {
			expect(path.getAttribute("fill")).toBeTruthy()
		})
	})

	it("shows tooltip with correct tool name via keyboard navigation", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "Some text" }),
			makeMsg({ type: "say", say: "readFile", text: '{"path": "/foo"}' }),
		]

		render(<TaskTimeline messages={messages} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()

		// Focus and navigate to the second bar
		container.focus()
		fireEvent.keyDown(container, { key: "ArrowRight" })
		fireEvent.keyDown(container, { key: "ArrowRight" })

		// Tooltip should appear with the second bar's tool name
		const tooltip = document.querySelector('[role="tooltip"]')
		expect(tooltip).toBeTruthy()
		expect(tooltip!.textContent).toBe("readFile")
	})

	it("shows tooltip on pointer hover with tool name", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "Some text" }),
			makeMsg({ type: "say", say: "readFile", text: '{"path": "/foo"}' }),
		]

		render(<TaskTimeline messages={messages} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()

		// Mock getBoundingClientRect to return a known position
		const originalGetBoundingClientRect = container.getBoundingClientRect.bind(container)
		container.getBoundingClientRect = () => ({
			left: 100,
			top: 200,
			right: 400,
			bottom: 226,
			width: 300,
			height: 26,
			x: 100,
			y: 200,
			toJSON: () => {},
		})

		// Use mouseMove which React maps to onPointerMove in some configurations
		// Second bar: x=13..25, center at 19. With container left=100, clientX should be 119.
		fireEvent(
			container,
			new MouseEvent("pointermove", {
				bubbles: true,
				clientX: 119,
				clientY: 213,
			}),
		)

		// Tooltip should appear with the tool name
		const tooltip = document.querySelector('[role="tooltip"]')
		expect(tooltip).toBeTruthy()
		expect(tooltip!.textContent).toBe("readFile")

		// Restore original
		container.getBoundingClientRect = originalGetBoundingClientRect
	})

	it("supports keyboard navigation with left/right arrows", () => {
		const messages = makeMessages(5, { type: "say", say: "text" })

		render(<TaskTimeline messages={messages} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()

		// Focus the container
		container.focus()

		// Press ArrowRight
		fireEvent.keyDown(container, { key: "ArrowRight" })

		// Should show a tooltip for the navigated bar
		const tooltip = document.querySelector('[role="tooltip"]')
		expect(tooltip).toBeTruthy()
	})

	it("applies pulsing animation class to running tool when isBusy is true", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "First" }),
			makeMsg({ type: "say", say: "text", text: "Second", partial: true }),
		]

		render(<TaskTimeline messages={messages} isBusy={true} />)

		// The last bar should have the animate-pulse class
		const pulseOverlay = document.querySelector(".animate-pulse")
		expect(pulseOverlay).toBeTruthy()
	})

	it("does not show pulsing animation when isBusy is false", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "First" }),
			makeMsg({ type: "say", say: "text", text: "Second" }),
		]

		render(<TaskTimeline messages={messages} isBusy={false} />)

		const pulseOverlay = document.querySelector(".animate-pulse")
		expect(pulseOverlay).toBeFalsy()
	})

	it("emits onBarSelect when a bar is clicked", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "First" }),
			makeMsg({ type: "say", say: "text", text: "Second" }),
		]

		const onBarSelect = vi.fn()

		render(<TaskTimeline messages={messages} onBarSelect={onBarSelect} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()

		// Click on the container
		fireEvent.click(container, { clientX: container.getBoundingClientRect().left + 10 })

		expect(onBarSelect).toHaveBeenCalled()
	})

	it("has correct aria-label for accessibility", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "Hello" }),
		]

		render(<TaskTimeline messages={messages} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()
		expect(container.getAttribute("aria-label")).toContain("Session activity timeline")
	})

	it("supports Home and End keys for navigation", () => {
		const messages = makeMessages(5, { type: "say", say: "text" })

		render(<TaskTimeline messages={messages} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()

		container.focus()

		// Press End to go to last bar
		fireEvent.keyDown(container, { key: "End" })

		const tooltipAfterEnd = document.querySelector('[role="tooltip"]')
		expect(tooltipAfterEnd).toBeTruthy()

		// Press Home to go to first bar
		fireEvent.keyDown(container, { key: "Home" })

		const tooltipAfterHome = document.querySelector('[role="tooltip"]')
		expect(tooltipAfterHome).toBeTruthy()
	})

	it("hides tooltip on blur", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "First" }),
			makeMsg({ type: "say", say: "text", text: "Second" }),
		]

		render(<TaskTimeline messages={messages} />)

		const container = document.querySelector('[role="img"]') as HTMLElement
		expect(container).toBeTruthy()

		// Show tooltip first
		container.focus()
		fireEvent.keyDown(container, { key: "ArrowRight" })

		expect(document.querySelector('[role="tooltip"]')).toBeTruthy()

		// Blur should hide tooltip
		fireEvent.blur(container)

		expect(document.querySelector('[role="tooltip"]')).toBeFalsy()
	})

	it("renders different colors for different message types", () => {
		const messages: ClineMessage[] = [
			makeMsg({ type: "say", say: "text", text: "Text response" }),
			makeMsg({ type: "say", say: "reasoning", text: "Thinking..." }),
			makeMsg({ type: "say", say: "error", text: "Something went wrong" }),
			makeMsg({ type: "say", say: "completion_result", text: "Done" }),
		]

		render(<TaskTimeline messages={messages} />)

		const svg = document.querySelector("svg")
		expect(svg).toBeTruthy()

		const paths = svg!.querySelectorAll("path")
		// Should have multiple paths with different fill colors
		const fills = new Set(Array.from(paths).map((p) => p.getAttribute("fill")))
		expect(fills.size).toBeGreaterThan(1)
	})
})