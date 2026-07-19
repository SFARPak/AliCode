import { useMemo } from "react"
import { ChevronDown, ChevronUp, ArrowUp, ArrowDownToLine } from "lucide-react"

import { useAppTranslation } from "@src/i18n/TranslationContext"

import { CollapsibleSection } from "./CollapsibleSection"
import {
	type SessionModelUsage,
	type TokenSummary,
	type ProviderInfo,
	type ModelUsageEntry,
	groupModelUsage,
	modelUsageName,
} from "./model-usage"

export interface TaskUsageProps {
	/** Compact token summary shown in the collapsed header row. */
	tokens: TokenSummary
	/** Optional per-model usage breakdown. When absent, only the summary renders. */
	usage?: SessionModelUsage
	/** Optional provider metadata used to resolve human-readable model names. */
	providers?: Record<string, ProviderInfo>
	/** Initial open state for the uncontrolled collapsible. */
	defaultOpen?: boolean
}

const formatCompactNumber = (value: number): string => {
	if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
	if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
	return String(value)
}

const formatCount = (value: number): string => value.toLocaleString()

const formatCost = (input: number): string => {
	const value = Math.max(0, Number.isFinite(input) ? input : 0)
	if (value > 0 && value < 0.000001) return "<$0.000001"
	return new Intl.NumberFormat("en", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 6,
	}).format(value)
}

const cacheHitRate = (model: ModelUsageEntry): string => {
	const total = model.tokens.input + model.tokens.cache.read
	if (total === 0) return "-"
	return `${((model.tokens.cache.read / total) * 100).toFixed(1)}%`
}

export const TaskUsage = ({ tokens, usage, providers, defaultOpen }: TaskUsageProps) => {
	const { t } = useAppTranslation()

	const groups = useMemo(
		() => groupModelUsage(usage?.models ?? [], providers ?? {}),
		[usage?.models, providers],
	)

	const hasModels = (usage?.models?.length ?? 0) > 0

	const Summary = (
		<span className="flex items-center gap-1.5 text-xs text-vscode-descriptionForeground">
			<span className="font-medium">{t("chat:taskUsage.tokens")}</span>
			{tokens.input > 0 && (
				<span className="flex items-center gap-0.5" data-testid="task-usage-summary-input">
					<ArrowUp className="size-2.5" />
					{formatCompactNumber(tokens.input)}
				</span>
			)}
			{tokens.output > 0 && (
				<span className="flex items-center gap-0.5" data-testid="task-usage-summary-output">
					<ArrowDownToLine className="size-2.5" />
					{formatCompactNumber(tokens.output)}
				</span>
			)}
			{tokens.cached > 0 && (
				<span className="flex items-center gap-0.5" data-testid="task-usage-summary-cached">
					<ArrowDownToLine className="size-2.5" />
					{t("chat:taskUsage.cache")} {formatCompactNumber(tokens.cached)}
				</span>
			)}
		</span>
	)

	if (!hasModels) {
		return (
			<div className="px-3 py-1" data-testid="task-usage-summary-only">
				{Summary}
			</div>
		)
	}

	return (
		<div className="px-3 py-1" data-testid="task-usage">
			<CollapsibleSection
				defaultOpen={defaultOpen}
				title={
					<div className="flex items-center justify-between w-full">
						{Summary}
						<span className="text-vscode-descriptionForeground text-xs flex items-center gap-1">
							{t("chat:taskUsage.details")}
							<ChevronDown className="size-3 [[data-state=open]_&]:hidden" />
							<ChevronUp className="size-3 [[data-state=closed]_&]:hidden" />
						</span>
					</div>
				}>
				<div
					className="mt-2 flex flex-col gap-3 text-xs text-vscode-foreground"
					data-testid="task-usage-detail">
					{groups.map((group) => (
						<section
							key={group.providerID}
							className="flex flex-col gap-1.5"
							data-testid="task-usage-provider">
							<h4 className="font-semibold text-vscode-foreground">{group.providerName}</h4>
							{group.models.map((model) => (
								<div
									key={`${model.providerID}/${model.modelID}`}
									className="flex flex-col gap-0.5 pl-2 border-l border-vscode-sideBar-background"
									data-testid="task-usage-model">
									<div
										className="font-medium text-vscode-foreground truncate"
										title={`${model.providerID}/${model.modelID}`}>
										{modelUsageName(model, providers ?? {})}
									</div>
									<div className="text-vscode-descriptionForeground" data-testid="task-usage-model-steps-cost">
										{model.steps}{" "}
										{model.steps === 1
											? t("chat:taskUsage.step")
											: t("chat:taskUsage.steps")}{" "}
										· {formatCost(model.cost)}
									</div>
									<div className="text-vscode-descriptionForeground" data-testid="task-usage-model-tokens">
										{t("chat:taskUsage.in")} {formatCount(model.tokens.input)} ·{" "}
										{t("chat:taskUsage.out")} {formatCount(model.tokens.output)} ·{" "}
										{t("chat:taskUsage.reason")} {formatCount(model.tokens.reasoning)}
									</div>
									<div
										className="text-vscode-descriptionForeground"
										data-testid="task-usage-model-cache">
										{t("chat:taskUsage.cacheR")} {formatCount(model.tokens.cache.read)} ·{" "}
										{t("chat:taskUsage.cacheW")} {formatCount(model.tokens.cache.write)} ·{" "}
										{t("chat:taskUsage.cacheHitRate")} {cacheHitRate(model)}
									</div>
								</div>
							))}
						</section>
					))}
				</div>
			</CollapsibleSection>
		</div>
	)
}

export default TaskUsage
