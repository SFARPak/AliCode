import i18next from "./setup"
/**
 * Initialize i18next with the specified language
 *
 * @param language The language code to use
 */
export declare function initializeI18n(language: string): void
/**
 * Get the current language
 *
 * @returns The current language code
 */
export declare function getCurrentLanguage(): string
/**
 * Change the current language
 *
 * @param language The language code to change to
 */
export declare function changeLanguage(language: string): void
/**
 * Translate a string using i18next
 *
 * @param key The translation key, can use namespace with colon, e.g. "common:welcome"
 * @param options Options for interpolation or pluralization
 * @returns The translated string
 */
export declare function t(key: string, options?: Record<string, any>): string
export default i18next
//# sourceMappingURL=index.d.ts.map
