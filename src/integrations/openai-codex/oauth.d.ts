import type { ExtensionContext } from "vscode"
import { z } from "zod"
/**
 * OpenAI Codex OAuth Configuration
 *
 * Based on the OpenAI Codex OAuth implementation guide:
 * - ISSUER: https://auth.openai.com
 * - Authorization endpoint: https://auth.openai.com/oauth/authorize
 * - Token endpoint: https://auth.openai.com/oauth/token
 * - Fixed callback port: 1455
 * - Codex-specific params: codex_cli_simplified_flow=true, originator=ali-code
 */
export declare const OPENAI_CODEX_OAUTH_CONFIG: {
	readonly authorizationEndpoint: "https://auth.openai.com/oauth/authorize"
	readonly tokenEndpoint: "https://auth.openai.com/oauth/token"
	readonly clientId: "app_EMoamEEZ73f0CkXaXp7hrann"
	readonly redirectUri: "http://localhost:1455/auth/callback"
	readonly scopes: "openid profile email offline_access"
	readonly callbackPort: 1455
}
declare const openAiCodexCredentialsSchema: z.ZodObject<
	{
		type: z.ZodLiteral<"openai-codex">
		access_token: z.ZodString
		refresh_token: z.ZodString
		expires: z.ZodNumber
		email: z.ZodOptional<z.ZodString>
		accountId: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		type: "openai-codex"
		refresh_token: string
		access_token: string
		expires: number
		email?: string | undefined
		accountId?: string | undefined
	},
	{
		type: "openai-codex"
		refresh_token: string
		access_token: string
		expires: number
		email?: string | undefined
		accountId?: string | undefined
	}
>
export type OpenAiCodexCredentials = z.infer<typeof openAiCodexCredentialsSchema>
/**
 * Generates a cryptographically random PKCE code verifier
 * Must be 43-128 characters long using unreserved characters
 */
export declare function generateCodeVerifier(): string
/**
 * Generates the PKCE code challenge from the verifier using S256 method
 */
export declare function generateCodeChallenge(verifier: string): string
/**
 * Generates a random state parameter for CSRF protection
 */
export declare function generateState(): string
/**
 * Builds the authorization URL for OpenAI Codex OAuth flow
 * Includes Codex-specific parameters per the implementation guide
 */
export declare function buildAuthorizationUrl(codeChallenge: string, state: string): string
/**
 * Exchanges the authorization code for tokens
 * Important: Uses application/x-www-form-urlencoded (not JSON)
 * Important: state must NOT be included in token exchange body
 */
export declare function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<OpenAiCodexCredentials>
/**
 * Refreshes the access token using the refresh token
 * Uses application/x-www-form-urlencoded (not JSON)
 */
export declare function refreshAccessToken(credentials: OpenAiCodexCredentials): Promise<OpenAiCodexCredentials>
/**
 * Checks if the credentials are expired (with 5 minute buffer)
 * Per the implementation guide: expires is in milliseconds since epoch
 */
export declare function isTokenExpired(credentials: OpenAiCodexCredentials): boolean
/**
 * OpenAiCodexOAuthManager - Handles OAuth flow and token management
 */
export declare class OpenAiCodexOAuthManager {
	private context
	private credentials
	private logFn
	private refreshPromise
	private pendingAuth
	private log
	private logError
	/**
	 * Initialize the OAuth manager with VS Code extension context
	 */
	initialize(context: ExtensionContext, logFn?: (message: string) => void): void
	/**
	 * Force a refresh using the stored refresh token even if the access token is not expired.
	 * Useful when the server invalidates an access token early.
	 */
	forceRefreshAccessToken(): Promise<string | null>
	/**
	 * Load credentials from storage
	 */
	loadCredentials(): Promise<OpenAiCodexCredentials | null>
	/**
	 * Save credentials to storage
	 */
	saveCredentials(credentials: OpenAiCodexCredentials): Promise<void>
	/**
	 * Clear credentials from storage
	 */
	clearCredentials(): Promise<void>
	/**
	 * Get a valid access token, refreshing if necessary
	 */
	getAccessToken(): Promise<string | null>
	/**
	 * Get the user's email from credentials
	 */
	getEmail(): Promise<string | null>
	/**
	 * Get the ChatGPT account ID from credentials
	 * Used for the ChatGPT-Account-Id header required by the Codex API
	 */
	getAccountId(): Promise<string | null>
	/**
	 * Check if the user is authenticated
	 */
	isAuthenticated(): Promise<boolean>
	/**
	 * Start the OAuth authorization flow
	 * Returns the authorization URL to open in browser
	 */
	startAuthorizationFlow(): string
	/**
	 * Start a local server to receive the OAuth callback
	 * Returns a promise that resolves when authentication is complete
	 */
	waitForCallback(): Promise<OpenAiCodexCredentials>
	/**
	 * Cancel any pending authorization flow
	 */
	cancelAuthorizationFlow(): void
	/**
	 * Get the current credentials (for display purposes)
	 */
	getCredentials(): OpenAiCodexCredentials | null
}
export declare const openAiCodexOAuthManager: OpenAiCodexOAuthManager
export {}
//# sourceMappingURL=oauth.d.ts.map
