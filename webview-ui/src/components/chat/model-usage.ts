/**
 * Per-model token/cost usage helpers.
 *
 * Ported from kilocode_tmp (SolidJS) to React. The shapes mirror the
 * `SessionModelUsage` response used by the kilocode SDK so the data can be
 * supplied directly when available. The current project does not yet plumb a
 * `SessionModelUsage` payload through `ExtensionStateContext`, so the
 * `TaskUsage` component accepts the data as a prop and gracefully renders
 * nothing when it is absent.
 */

/** Per-model token bucket. */
export interface ModelUsageTokens {
	input: number
	output: number
	reasoning: number
	cache: {
		read: number
		write: number
	}
}

/** A single model's usage entry within a session. */
export interface ModelUsageEntry {
	providerID: string
	modelID: string
	steps: number
	cost: number
	tokens: ModelUsageTokens
}

/** Aggregate session usage across all models. */
export interface SessionModelUsage {
	sessionIDs?: string[]
	totals: {
		steps: number
		cost: number
		tokens: ModelUsageTokens
	}
	models: ModelUsageEntry[]
}

/** Compact token summary used by the collapsed header row. */
export type TokenSummary = { input: number; output: number; cached: number }

/** Provider metadata used to resolve human-readable model names. */
export interface ProviderInfo {
	id: string
	name: string
	models?: Record<string, { id: string; name: string }>
}

const DATE_SUFFIX = /(?:-(?:20\d{6}|20\d{2}-\d{2}-\d{2}))(?:-v\d+(?::\d+)?)?$/i

/**
 * Returns true when the supplied usage payload contains any meaningful data.
 */
export function hasModelUsage(usage: SessionModelUsage | undefined): usage is SessionModelUsage {
	if (!usage) return false
	const tokens = usage.totals?.tokens
	return (
		(usage.models?.length ?? 0) > 0 ||
		(usage.totals?.steps ?? 0) > 0 ||
		(usage.totals?.cost ?? 0) > 0 ||
		(tokens?.input ?? 0) > 0 ||
		(tokens?.output ?? 0) > 0 ||
		(tokens?.reasoning ?? 0) > 0 ||
		(tokens?.cache?.read ?? 0) > 0 ||
		(tokens?.cache?.write ?? 0) > 0
	)
}

/**
 * Derives a compact token summary from a session usage payload.
 */
export function tokenSummary(usage: SessionModelUsage): TokenSummary {
	return {
		input: usage.totals.tokens.input,
		output: usage.totals.tokens.output,
		cached: usage.totals.tokens.cache.read,
	}
}

export interface GroupedModelUsage {
	providerID: string
	providerName: string
	models: ModelUsageEntry[]
}

/**
 * Groups per-model usage entries by provider ID.
 */
export function groupModelUsage(
	models: ModelUsageEntry[],
	providers: Record<string, ProviderInfo>,
): GroupedModelUsage[] {
	const groups = new Map<string, GroupedModelUsage>()
	for (const model of models) {
		const existing = groups.get(model.providerID)
		if (existing) {
			existing.models.push(model)
		} else {
			groups.set(model.providerID, {
				providerID: model.providerID,
				providerName: providers[model.providerID]?.name ?? model.providerID,
				models: [model],
			})
		}
	}
	return [...groups.values()]
}

/**
 * Resolves a human-readable model name from provider metadata.
 */
export function modelUsageName(model: ModelUsageEntry, providers: Record<string, ProviderInfo>): string {
	const provider = providers[model.providerID]
	const id = model.modelID.replace(DATE_SUFFIX, "")
	const name =
		provider?.models?.[model.modelID]?.name ??
		provider?.models?.[id]?.name ??
		id
	return name
		.replace(/^[^:]+:\s*/, "")
		.replace(/^[^/]+\//, "")
		.replace(/\s*\([^)]*%\s*off[^)]*\)\s*$/i, "")
		.replace(/^qwen(?=\d)/i, "Qwen ")
}
