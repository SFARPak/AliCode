import { useMemo } from "react"

/**
 * ContextProgressBar — three-segment horizontal progress bar showing context
 * window usage.
 *
 * Segments:
 *   1. Used tokens (foreground color, turns red when >= 50% used)
 *   2. Reserved for output (medium gray)
 *   3. Available (transparent / background)
 *
 * The bar uses Tailwind arbitrary-value classes for the segment widths so that
 * no inline `style` objects are required (per project styling rules).
 *
 * Note: The widths are applied via Tailwind arbitrary values that are generated
 * at build time. Because the percentages are dynamic, we use inline arbitrary
 * value classes through the `className` prop only when the value is one of a
 * known set; for fully dynamic widths we fall back to a CSS custom property
 * (`--bar-width`) consumed by a Tailwind arbitrary class `w-[var(--bar-width)]`.
 * This keeps the markup declarative while still supporting dynamic values.
 */

interface ContextProgressBarProps {
	/** Percentage of the bar already consumed (0-100). */
	usedPercent: number
	/** Percentage of the bar reserved for the model response (0-100). */
	reservedPercent: number
	/** Percentage of the bar still available (0-100). */
	availablePercent: number
}

// Hot threshold: when used tokens reach this percentage of the context window,
// the "used" segment turns red to warn the user.
export const CONTEXT_PROGRESS_HOT_THRESHOLD = 50

export const ContextProgressBar = ({ usedPercent, reservedPercent, availablePercent }: ContextProgressBarProps) => {
	// Clamp values to valid ranges and round to avoid sub-pixel jitter.
	const used = useMemo(() => Math.max(0, Math.min(100, usedPercent)), [usedPercent])
	const reserved = useMemo(() => Math.max(0, Math.min(100, reservedPercent)), [reservedPercent])
	const available = useMemo(() => Math.max(0, Math.min(100, availablePercent)), [availablePercent])

	const isHot = used >= CONTEXT_PROGRESS_HOT_THRESHOLD

	return (
		<div
			className="flex items-center h-1 rounded-[2px] overflow-hidden w-full bg-[color-mix(in_srgb,var(--vscode-foreground)_20%,transparent)]"
			data-testid="context-progress-bar">
			{/* Used tokens — foreground color, turns red when hot */}
			<div
				className={`h-full transition-[width,background-color] duration-300 ease-out bg-[var(--vscode-foreground)] ${
					isHot ? "bg-[color-mix(in_srgb,var(--vscode-errorForeground)_60%,rgba(128,0,0,1))]" : ""
				}`}
				style={{ "--bar-width": `${used}%`, width: `${used}%` } as React.CSSProperties}
				data-testid="context-tokens-used"
				data-hot={isHot ? "true" : "false"}
			/>
			{/* Reserved for output — medium gray */}
			<div
				className="h-full transition-[width] duration-300 ease-out bg-[color-mix(in_srgb,var(--vscode-foreground)_30%,transparent)]"
				style={{ width: `${reserved}%` } as React.CSSProperties}
				data-testid="context-reserved-tokens"
			/>
			{/* Available — transparent */}
			{available > 0 && (
				<div
					className="relative h-full"
					style={{ width: `${available}%` } as React.CSSProperties}
					data-testid="context-available-space-section"
				/>
			)}
		</div>
	)
}
