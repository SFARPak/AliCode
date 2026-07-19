// npm run test ContextProgressBar.spec.tsx

import { render, screen } from "@/utils/test-utils"

import { ContextProgressBar, CONTEXT_PROGRESS_HOT_THRESHOLD } from "@src/components/chat/ContextProgressBar"

describe("ContextProgressBar", () => {
	it("renders the three segments with the expected test ids", () => {
		render(<ContextProgressBar usedPercent={25} reservedPercent={25} availablePercent={50} />)

		expect(screen.getByTestId("context-progress-bar")).toBeInTheDocument()
		expect(screen.getByTestId("context-tokens-used")).toBeInTheDocument()
		expect(screen.getByTestId("context-reserved-tokens")).toBeInTheDocument()
		expect(screen.getByTestId("context-available-space-section")).toBeInTheDocument()
	})

	it("does not render the available segment when available is 0", () => {
		render(<ContextProgressBar usedPercent={50} reservedPercent={50} availablePercent={0} />)

		expect(screen.getByTestId("context-tokens-used")).toBeInTheDocument()
		expect(screen.getByTestId("context-reserved-tokens")).toBeInTheDocument()
		expect(screen.queryByTestId("context-available-space-section")).not.toBeInTheDocument()
	})

	it("marks the used segment as hot when usage reaches the threshold", () => {
		render(
			<ContextProgressBar
				usedPercent={CONTEXT_PROGRESS_HOT_THRESHOLD}
				reservedPercent={10}
				availablePercent={40}
			/>,
		)

		const used = screen.getByTestId("context-tokens-used")
		expect(used).toHaveAttribute("data-hot", "true")
	})

	it("does not mark the used segment as hot below the threshold", () => {
		render(
			<ContextProgressBar
				usedPercent={CONTEXT_PROGRESS_HOT_THRESHOLD - 1}
				reservedPercent={10}
				availablePercent={41}
			/>,
		)

		const used = screen.getByTestId("context-tokens-used")
		expect(used).toHaveAttribute("data-hot", "false")
	})

	it("clamps out-of-range percentages to valid bounds", () => {
		render(<ContextProgressBar usedPercent={-10} reservedPercent={200} availablePercent={50} />)

		const used = screen.getByTestId("context-tokens-used") as HTMLElement
		const reserved = screen.getByTestId("context-reserved-tokens") as HTMLElement

		// Negative used should be clamped to 0 -> not hot
		expect(used).toHaveAttribute("data-hot", "false")
		expect(used.style.width).toBe("0%")
		// Reserved over 100 should be clamped to 100
		expect(reserved.style.width).toBe("100%")
	})
})
