/**
 * Common character mappings for normalization
 */
export declare const NORMALIZATION_MAPS: {
	SMART_QUOTES: {
		"\u201C": string
		"\u201D": string
		"\u2018": string
		"\u2019": string
	}
	TYPOGRAPHIC: {
		"\u2026": string
		"\u2014": string
		"\u2013": string
		"\u00A0": string
	}
}
/**
 * Options for string normalization
 */
export interface NormalizeOptions {
	smartQuotes?: boolean
	typographicChars?: boolean
	extraWhitespace?: boolean
	trim?: boolean
}
/**
 * Normalizes a string based on the specified options
 *
 * @param str The string to normalize
 * @param options Normalization options
 * @returns The normalized string
 */
export declare function normalizeString(str: string, options?: NormalizeOptions): string
/**
 * Unescapes common HTML entities in a string
 *
 * @param text The string containing HTML entities to unescape
 * @returns The unescaped string with HTML entities converted to their literal characters
 */
export declare function unescapeHtmlEntities(text: string): string
//# sourceMappingURL=text-normalization.d.ts.map
