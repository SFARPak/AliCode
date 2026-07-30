export declare const REQUESTY_BASE_URL = "https://router.requesty.ai/v1"
type URLType = "router" | "app" | "api"
/**
 * Converts a base URL to a Requesty service URL with proper validation and fallback
 * @param baseUrl Optional custom base URL. Falls back to default if invalid or not provided
 * @param service The service type (router, app, or api). Defaults to 'router'
 * @returns A valid Requesty service URL
 */
export declare const toRequestyServiceUrl: (baseUrl?: string | null, service?: URLType) => string
export {}
//# sourceMappingURL=requesty.d.ts.map
