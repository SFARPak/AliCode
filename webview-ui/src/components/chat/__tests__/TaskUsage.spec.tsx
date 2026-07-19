import React from "react"
import { render, screen, fireEvent } from "@/utils/test-utils"

import { TaskUsage } from "../TaskUsage"
import type { SessionModelUsage, ProviderInfo } from "../model-usage"

// Mock the translation hook so we get stable, predictable strings.
vi.mock("@src/i18n/TranslationContext", () => ({
	useAppTranslation: () => ({
		t: (key: string) => {
			const map: Record<string, string> = {
				"chat:taskUsage.tokens": "Tokens",
				"chat:taskUsage.cache": "cache",
				"chat:taskUsage.details": "Details",
				"chat:taskUsage.step": "step",
				"chat:taskUsage.steps": "steps",
				"chat:taskUsage.in": "In",
				"chat:taskUsage.out": "Out",
				"chat:taskUsage.reason": "Reason",
				"chat:taskUsage.cacheR": "Cache R",
				"chat:taskUsage.cacheW": "W",
				"chat:taskUsage.cacheHitRate": "Hit Rate",
			}
			return map[key] ?? key
		},
	}),
}))

const usageTokens = {
	input: 12_000,
	output: 3_400,
	reasoning: 560,
	cache: { read: 8_000, write: 1_200 },
}

const buildUsage = (overrides: Partial<SessionModelUsage> = {}): SessionModelUsage => ({
	totals: {
		steps: 4,
		cost: 0.097214,
		tokens: usageTokens,
	},
	models: [
		{
			providerID: "kilo",
			modelID: "qwen/qwen3.7-plus-20260602",
			steps: 3,
			cost: 0.067214,
			tokens: usageTokens,
		},
	],
	...overrides,
})

const providers: Record<string, ProviderInfo> = {
	kilo: {
		id: "kilo",
		name: "Kilo Gateway",
		models: {
			"qwen/qwen3.7-plus": { id: "qwen/qwen3.7-plus", name: "Qwen: Qwen3.7 Plus (20% off)" },
		},
	},
	minimax: {
		id: "minimax",
		name: "MiniMax",
		models: { "minimax-m3": { id: "minimax-m3", name: "MiniMax M3" } },
	},
}

describe("TaskUsage", () => {
	it("renders nothing when there is no usage data", () => {
		const { container } = render(
			<TaskUsage tokens={{ input: 0, output: 0, cached: 0 }} usage={undefined} />,
		)

		// No per-model breakdown should be rendered.
		expect(screen.queryByTestId("task-usage")).not.toBeInTheDocument()
		expect(screen.queryByTestId("task-usage-detail")).not.toBeInTheDocument()
		expect(container.querySelector("[data-testid='task-usage-summary-only']")).not.toBeNull()
	})

	it("renders the summary-only view when usage has no models", () => {
		const usage = buildUsage({ models: [] })

		render(<TaskUsage tokens={{ input: 100, output: 50, cached: 0 }} usage={usage} />)

		expect(screen.getByTestId("task-usage-summary-only")).toBeInTheDocument()
		expect(screen.queryByTestId("task-usage")).not.toBeInTheDocument()
	})

	it("renders model names and token counts when usage data is provided", () => {
		const usage = buildUsage()

		render(
			<TaskUsage
				tokens={{
					input: usage.totals.tokens.input,
					output: usage.totals.tokens.output,
					cached: usage.totals.tokens.cache.read,
				}}
				usage={usage}
				providers={providers}
			/>,
		)

		// Collapsed summary shows compact token counts.
		expect(screen.getByTestId("task-usage-summary-input")).toHaveTextContent("12.0K")
		expect(screen.getByTestId("task-usage-summary-output")).toHaveTextContent("3.4K")
		expect(screen.getByTestId("task-usage-summary-cached")).toHaveTextContent("8.0K")

		// Expand the collapsible to reveal the per-model breakdown.
		const toggle = screen.getByRole("button", { name: "toggle" })
		fireEvent.click(toggle)

		// Model name should be resolved via provider metadata.
		expect(screen.getByText("Qwen 3.7 Plus")).toBeInTheDocument()

		// Per-model token counts are rendered with locale formatting.
		const modelTokens = screen.getByTestId("task-usage-model-tokens")
		expect(modelTokens).toHaveTextContent("In 12,000")
		expect(modelTokens).toHaveTextContent("Out 3,400")
		expect(modelTokens).toHaveTextContent("Reason 560")
	})

	it("renders cost when available", () => {
		const usage = buildUsage()

		render(
			<TaskUsage
				tokens={{ input: 0, output: 0, cached: 0 }}
				usage={usage}
				providers={providers}
			/>,
		)

		// Expand the collapsible.
		fireEvent.click(screen.getByRole("button", { name: "toggle" }))

		const stepsCost = screen.getByTestId("task-usage-model-steps-cost")
		// 3 steps + currency-formatted cost.
		expect(stepsCost).toHaveTextContent("3 steps")
		expect(stepsCost).toHaveTextContent("$0.067214")
	})

	it("supports collapsible expand/collapse", () => {
		const usage = buildUsage()

		render(
			<TaskUsage
				tokens={{ input: 0, output: 0, cached: 0 }}
				usage={usage}
				providers={providers}
			/>,
		)

		// Detail is not present while collapsed.
		expect(screen.queryByTestId("task-usage-detail")).not.toBeInTheDocument()

		// Expand.
		fireEvent.click(screen.getByRole("button", { name: "toggle" }))
		expect(screen.getByTestId("task-usage-detail")).toBeInTheDocument()

		// Collapse again.
		fireEvent.click(screen.getByRole("button", { name: "toggle" }))
		expect(screen.queryByTestId("task-usage-detail")).not.toBeInTheDocument()
	})

	it("shows multiple models grouped by provider correctly", () => {
		const usage = buildUsage({
			models: [
				{
					providerID: "kilo",
					modelID: "qwen/qwen3.7-plus-20260602",
					steps: 3,
					cost: 0.067214,
					tokens: usageTokens,
				},
				{
					providerID: "minimax",
					modelID: "minimax-m3",
					steps: 1,
					cost: 0.03,
					tokens: { input: 8_400, output: 710, reasoning: 120, cache: { read: 14_000, write: 900 } },
				},
			],
		})

		render(
			<TaskUsage
				tokens={{ input: 0, output: 0, cached: 0 }}
				usage={usage}
				providers={providers}
			/>,
		)

		// Expand.
		fireEvent.click(screen.getByRole("button", { name: "toggle" }))

		// Two provider groups.
		const providerSections = screen.getAllByTestId("task-usage-provider")
		expect(providerSections).toHaveLength(2)
		expect(screen.getByText("Kilo Gateway")).toBeInTheDocument()
		expect(screen.getByText("MiniMax")).toBeInTheDocument()

		// Two model entries.
		const modelEntries = screen.getAllByTestId("task-usage-model")
		expect(modelEntries).toHaveLength(2)
		expect(screen.getByText("Qwen 3.7 Plus")).toBeInTheDocument()
		expect(screen.getByText("MiniMax M3")).toBeInTheDocument()
	})
})
