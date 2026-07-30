export const INDEXING_PLUGIN_NAMES = ["@ali-code/kilo-indexing"] as const

export function hasIndexingPlugin(_name: string): boolean {
	return INDEXING_PLUGIN_NAMES.includes(_name as (typeof INDEXING_PLUGIN_NAMES)[number])
}

export function isIndexingPlugin(_name: string): boolean {
	return hasIndexingPlugin(_name)
}

export function normalizePluginName(name: string): string {
	return name
}
