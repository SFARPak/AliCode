import { type Language } from "@ali-code/types"
/**
 * Language name mapping from ISO codes to full language names.
 */
export declare const LANGUAGES: Record<Language, string>
/**
 * Formats a VSCode locale string to ensure the region code is uppercase.
 * For example, transforms "en-us" to "en-US" or "fr-ca" to "fr-CA".
 *
 * @param vscodeLocale - The VSCode locale string to format (e.g., "en-us", "fr-ca")
 * @returns The formatted locale string with uppercase region code
 */
export declare function formatLanguage(vscodeLocale: string): Language
//# sourceMappingURL=language.d.ts.map
