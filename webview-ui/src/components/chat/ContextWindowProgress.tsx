import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { formatLargeNumber } from "@/utils/format"
import { calculateTokenDistribution } from "@/utils/model-utils"
import { StandardTooltip } from "@/components/ui"
import { ContextProgressBar } from "./ContextProgressBar"

interface ContextWindowProgressProps {
	contextWindow: number
	contextTokens: number
	maxTokens?: number
}

export const ContextWindowProgress = ({ contextWindow, contextTokens, maxTokens }: ContextWindowProgressProps) => {
	const { t } = useTranslation()

	// Use the shared utility function to calculate all token distribution values
	const tokenDistribution = useMemo(
		() => calculateTokenDistribution(contextWindow, contextTokens, maxTokens),
		[contextWindow, contextTokens, maxTokens],
	)

	// Destructure the values we need
	const { currentPercent, reservedPercent, availableSize, reservedForOutput, availablePercent } = tokenDistribution

	// For display purposes
	const safeContextWindow = Math.max(0, contextWindow)
	const safeContextTokens = Math.max(0, contextTokens)

	// Combine all tooltip content into a single tooltip
	const tooltipContent = (
		<div className="space-y-1">
			<div>
				{t("chat:tokenProgress.tokensUsed", {
					used: formatLargeNumber(safeContextTokens),
					total: formatLargeNumber(safeContextWindow),
				})}
			</div>
			{reservedForOutput > 0 && (
				<div>
					{t("chat:tokenProgress.reservedForResponse", {
						amount: formatLargeNumber(reservedForOutput),
					})}
				</div>
			)}
			{availableSize > 0 && (
				<div>
					{t("chat:tokenProgress.availableSpace", {
						amount: formatLargeNumber(availableSize),
					})}
				</div>
			)}
		</div>
	)

	return (
		<div className="flex items-center gap-2 flex-1 whitespace-nowrap">
			<div data-testid="context-tokens-count">{formatLargeNumber(safeContextTokens)}</div>
			<StandardTooltip content={tooltipContent} side="top" sideOffset={8}>
				<div className="flex-1 relative">
					<ContextProgressBar
						usedPercent={currentPercent}
						reservedPercent={reservedPercent}
						availablePercent={availablePercent}
					/>
				</div>
			</StandardTooltip>
			<div data-testid="context-window-size">{formatLargeNumber(safeContextWindow)}</div>
		</div>
	)
}
