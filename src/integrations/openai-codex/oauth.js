"use strict"
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
exports.openAiCodexOAuthManager = exports.OpenAiCodexOAuthManager = exports.OPENAI_CODEX_OAUTH_CONFIG = void 0
exports.generateCodeVerifier = generateCodeVerifier
exports.generateCodeChallenge = generateCodeChallenge
exports.generateState = generateState
exports.buildAuthorizationUrl = buildAuthorizationUrl
exports.exchangeCodeForTokens = exchangeCodeForTokens
exports.refreshAccessToken = refreshAccessToken
exports.isTokenExpired = isTokenExpired
const crypto = __importStar(require("crypto"))
const http = __importStar(require("http"))
const url_1 = require("url")
const zod_1 = require("zod")
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
exports.OPENAI_CODEX_OAUTH_CONFIG = {
	authorizationEndpoint: "https://auth.openai.com/oauth/authorize",
	tokenEndpoint: "https://auth.openai.com/oauth/token",
	clientId: "app_EMoamEEZ73f0CkXaXp7hrann",
	redirectUri: "http://localhost:1455/auth/callback",
	scopes: "openid profile email offline_access",
	callbackPort: 1455,
}
// Token storage key
const OPENAI_CODEX_CREDENTIALS_KEY = "openai-codex-oauth-credentials"
// Credentials schema
const openAiCodexCredentialsSchema = zod_1.z.object({
	type: zod_1.z.literal("openai-codex"),
	access_token: zod_1.z.string().min(1),
	refresh_token: zod_1.z.string().min(1),
	// expires is in milliseconds since epoch
	expires: zod_1.z.number(),
	email: zod_1.z.string().optional(),
	// ChatGPT account ID extracted from JWT claims (for ChatGPT-Account-Id header)
	accountId: zod_1.z.string().optional(),
})
// Token response schema from OpenAI
const tokenResponseSchema = zod_1.z.object({
	access_token: zod_1.z.string(),
	refresh_token: zod_1.z.string().min(1).optional(),
	id_token: zod_1.z.string().optional(),
	expires_in: zod_1.z.number(),
	email: zod_1.z.string().optional(),
	token_type: zod_1.z.string().optional(),
})
/**
 * Parse JWT claims from a token
 * Returns undefined if the token is invalid or cannot be parsed
 */
function parseJwtClaims(token) {
	const parts = token.split(".")
	if (parts.length !== 3) return undefined
	try {
		// Use base64url decoding (Node.js Buffer handles this)
		const payload = Buffer.from(parts[1], "base64url").toString("utf-8")
		return JSON.parse(payload)
	} catch {
		return undefined
	}
}
/**
 * Extract ChatGPT account ID from JWT claims
 * Checks multiple locations:
 * 1. Root-level chatgpt_account_id
 * 2. Nested under https://api.openai.com/auth
 * 3. First organization ID
 */
function extractAccountIdFromClaims(claims) {
	return (
		claims.chatgpt_account_id ||
		claims["https://api.openai.com/auth"]?.chatgpt_account_id ||
		claims.organizations?.[0]?.id
	)
}
/**
 * Extract ChatGPT account ID from token response
 * Tries id_token first, then access_token
 */
function extractAccountId(tokens) {
	// Try id_token first (more reliable source)
	if (tokens.id_token) {
		const claims = parseJwtClaims(tokens.id_token)
		const accountId = claims && extractAccountIdFromClaims(claims)
		if (accountId) return accountId
	}
	// Fall back to access_token
	if (tokens.access_token) {
		const claims = parseJwtClaims(tokens.access_token)
		return claims ? extractAccountIdFromClaims(claims) : undefined
	}
	return undefined
}
class OpenAiCodexOAuthTokenError extends Error {
	status
	errorCode
	constructor(message, opts) {
		super(message)
		this.name = "OpenAiCodexOAuthTokenError"
		this.status = opts?.status
		this.errorCode = opts?.errorCode
	}
	isLikelyInvalidGrant() {
		if (this.errorCode && /invalid_grant/i.test(this.errorCode)) {
			return true
		}
		if (this.status === 400 || this.status === 401 || this.status === 403) {
			return /invalid_grant|revoked|expired|invalid refresh/i.test(this.message)
		}
		return false
	}
}
function parseOAuthErrorDetails(errorText) {
	try {
		const json = JSON.parse(errorText)
		if (!json || typeof json !== "object") {
			return {}
		}
		const obj = json
		const errorField = obj.error
		const errorCode =
			typeof errorField === "string"
				? errorField
				: errorField && typeof errorField === "object" && typeof errorField.type === "string"
					? errorField.type
					: undefined
		const errorDescription = obj.error_description
		const errorMessageFromError = errorField && typeof errorField === "object" ? errorField.message : undefined
		const errorMessage =
			typeof errorDescription === "string"
				? errorDescription
				: typeof errorMessageFromError === "string"
					? errorMessageFromError
					: typeof obj.message === "string"
						? obj.message
						: undefined
		return { errorCode, errorMessage }
	} catch {
		return {}
	}
}
/**
 * Generates a cryptographically random PKCE code verifier
 * Must be 43-128 characters long using unreserved characters
 */
function generateCodeVerifier() {
	const buffer = crypto.randomBytes(32)
	return buffer.toString("base64url")
}
/**
 * Generates the PKCE code challenge from the verifier using S256 method
 */
function generateCodeChallenge(verifier) {
	const hash = crypto.createHash("sha256").update(verifier).digest()
	return hash.toString("base64url")
}
/**
 * Generates a random state parameter for CSRF protection
 */
function generateState() {
	return crypto.randomBytes(16).toString("hex")
}
/**
 * Builds the authorization URL for OpenAI Codex OAuth flow
 * Includes Codex-specific parameters per the implementation guide
 */
function buildAuthorizationUrl(codeChallenge, state) {
	const params = new URLSearchParams({
		client_id: exports.OPENAI_CODEX_OAUTH_CONFIG.clientId,
		redirect_uri: exports.OPENAI_CODEX_OAUTH_CONFIG.redirectUri,
		scope: exports.OPENAI_CODEX_OAUTH_CONFIG.scopes,
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		response_type: "code",
		state,
		// Codex-specific parameters
		codex_cli_simplified_flow: "true",
		originator: "ali-code",
	})
	return `${exports.OPENAI_CODEX_OAUTH_CONFIG.authorizationEndpoint}?${params.toString()}`
}
/**
 * Exchanges the authorization code for tokens
 * Important: Uses application/x-www-form-urlencoded (not JSON)
 * Important: state must NOT be included in token exchange body
 */
async function exchangeCodeForTokens(code, codeVerifier) {
	// Per the implementation guide: use application/x-www-form-urlencoded
	// and do NOT include state in the body (OpenAI returns error if included)
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		client_id: exports.OPENAI_CODEX_OAUTH_CONFIG.clientId,
		code,
		redirect_uri: exports.OPENAI_CODEX_OAUTH_CONFIG.redirectUri,
		code_verifier: codeVerifier,
	})
	const response = await fetch(exports.OPENAI_CODEX_OAUTH_CONFIG.tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: body.toString(),
		signal: AbortSignal.timeout(30000),
	})
	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`)
	}
	const data = await response.json()
	const tokenResponse = tokenResponseSchema.parse(data)
	if (!tokenResponse.refresh_token) {
		throw new Error("Token exchange did not return a refresh_token")
	}
	// Per the implementation guide: expires is in milliseconds since epoch
	const expiresAt = Date.now() + tokenResponse.expires_in * 1000
	// Extract ChatGPT account ID from JWT claims
	const accountId = extractAccountId({
		id_token: tokenResponse.id_token,
		access_token: tokenResponse.access_token,
	})
	return {
		type: "openai-codex",
		access_token: tokenResponse.access_token,
		refresh_token: tokenResponse.refresh_token,
		expires: expiresAt,
		email: tokenResponse.email,
		accountId,
	}
}
/**
 * Refreshes the access token using the refresh token
 * Uses application/x-www-form-urlencoded (not JSON)
 */
async function refreshAccessToken(credentials) {
	const body = new URLSearchParams({
		grant_type: "refresh_token",
		client_id: exports.OPENAI_CODEX_OAUTH_CONFIG.clientId,
		refresh_token: credentials.refresh_token,
	})
	const response = await fetch(exports.OPENAI_CODEX_OAUTH_CONFIG.tokenEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: body.toString(),
		signal: AbortSignal.timeout(30000),
	})
	if (!response.ok) {
		const errorText = await response.text()
		const { errorCode, errorMessage } = parseOAuthErrorDetails(errorText)
		const details = errorMessage ? errorMessage : errorText
		throw new OpenAiCodexOAuthTokenError(
			`Token refresh failed: ${response.status} ${response.statusText}${details ? ` - ${details}` : ""}`,
			{ status: response.status, errorCode },
		)
	}
	const data = await response.json()
	const tokenResponse = tokenResponseSchema.parse(data)
	// Per the implementation guide: expires is in milliseconds since epoch
	const expiresAt = Date.now() + tokenResponse.expires_in * 1000
	// Extract new account ID from refreshed tokens, or preserve existing one
	const newAccountId = extractAccountId({
		id_token: tokenResponse.id_token,
		access_token: tokenResponse.access_token,
	})
	return {
		type: "openai-codex",
		access_token: tokenResponse.access_token,
		refresh_token: tokenResponse.refresh_token ?? credentials.refresh_token,
		expires: expiresAt,
		email: tokenResponse.email ?? credentials.email,
		// Prefer newly extracted accountId, fall back to existing
		accountId: newAccountId ?? credentials.accountId,
	}
}
/**
 * Checks if the credentials are expired (with 5 minute buffer)
 * Per the implementation guide: expires is in milliseconds since epoch
 */
function isTokenExpired(credentials) {
	const bufferMs = 5 * 60 * 1000 // 5 minutes buffer
	return Date.now() >= credentials.expires - bufferMs
}
/**
 * OpenAiCodexOAuthManager - Handles OAuth flow and token management
 */
class OpenAiCodexOAuthManager {
	context = null
	credentials = null
	logFn = null
	refreshPromise = null
	pendingAuth = null
	log(message) {
		if (this.logFn) {
			this.logFn(message)
		} else {
			console.log(message)
		}
	}
	logError(message, error) {
		const details = error instanceof Error ? error.message : error !== undefined ? String(error) : undefined
		const full = details ? `${message} ${details}` : message
		this.log(full)
		console.error(full)
	}
	/**
	 * Initialize the OAuth manager with VS Code extension context
	 */
	initialize(context, logFn) {
		this.context = context
		this.logFn = logFn ?? null
	}
	/**
	 * Force a refresh using the stored refresh token even if the access token is not expired.
	 * Useful when the server invalidates an access token early.
	 */
	async forceRefreshAccessToken() {
		if (!this.credentials) {
			await this.loadCredentials()
		}
		if (!this.credentials) {
			return null
		}
		try {
			// De-dupe concurrent refreshes
			if (!this.refreshPromise) {
				const prevRefreshToken = this.credentials.refresh_token
				this.log(`[openai-codex-oauth] Forcing token refresh (expires=${this.credentials.expires})...`)
				this.refreshPromise = refreshAccessToken(this.credentials).then((newCreds) => {
					const rotated = newCreds.refresh_token !== prevRefreshToken
					this.log(
						`[openai-codex-oauth] Forced refresh response received (expires_in≈${Math.round((newCreds.expires - Date.now()) / 1000)}s, refresh_token_rotated=${rotated})`,
					)
					return newCreds
				})
			}
			const newCredentials = await this.refreshPromise
			this.refreshPromise = null
			await this.saveCredentials(newCredentials)
			this.log(`[openai-codex-oauth] Forced token persisted (expires=${newCredentials.expires})`)
			return newCredentials.access_token
		} catch (error) {
			this.refreshPromise = null
			this.logError("[openai-codex-oauth] Failed to force refresh token:", error)
			if (error instanceof OpenAiCodexOAuthTokenError && error.isLikelyInvalidGrant()) {
				this.log("[openai-codex-oauth] Refresh token appears invalid; clearing stored credentials")
				await this.clearCredentials()
			}
			return null
		}
	}
	/**
	 * Load credentials from storage
	 */
	async loadCredentials() {
		if (!this.context) {
			return null
		}
		try {
			const credentialsJson = await this.context.secrets.get(OPENAI_CODEX_CREDENTIALS_KEY)
			if (!credentialsJson) {
				return null
			}
			const parsed = JSON.parse(credentialsJson)
			this.credentials = openAiCodexCredentialsSchema.parse(parsed)
			return this.credentials
		} catch (error) {
			this.logError("[openai-codex-oauth] Failed to load credentials:", error)
			return null
		}
	}
	/**
	 * Save credentials to storage
	 */
	async saveCredentials(credentials) {
		if (!this.context) {
			throw new Error("OAuth manager not initialized")
		}
		await this.context.secrets.store(OPENAI_CODEX_CREDENTIALS_KEY, JSON.stringify(credentials))
		this.credentials = credentials
	}
	/**
	 * Clear credentials from storage
	 */
	async clearCredentials() {
		if (!this.context) {
			return
		}
		await this.context.secrets.delete(OPENAI_CODEX_CREDENTIALS_KEY)
		this.credentials = null
	}
	/**
	 * Get a valid access token, refreshing if necessary
	 */
	async getAccessToken() {
		// Try to load credentials if not already loaded
		if (!this.credentials) {
			await this.loadCredentials()
		}
		if (!this.credentials) {
			return null
		}
		// Check if token is expired and refresh if needed
		if (isTokenExpired(this.credentials)) {
			try {
				// De-dupe concurrent refreshes
				if (!this.refreshPromise) {
					this.log(
						`[openai-codex-oauth] Access token expired (expires=${this.credentials.expires}). Refreshing...`,
					)
					const prevRefreshToken = this.credentials.refresh_token
					this.refreshPromise = refreshAccessToken(this.credentials).then((newCreds) => {
						const rotated = newCreds.refresh_token !== prevRefreshToken
						this.log(
							`[openai-codex-oauth] Refresh response received (expires_in≈${Math.round((newCreds.expires - Date.now()) / 1000)}s, refresh_token_rotated=${rotated})`,
						)
						return newCreds
					})
				}
				const newCredentials = await this.refreshPromise
				this.refreshPromise = null
				await this.saveCredentials(newCredentials)
				this.log(`[openai-codex-oauth] Token persisted (expires=${newCredentials.expires})`)
			} catch (error) {
				this.refreshPromise = null
				this.logError("[openai-codex-oauth] Failed to refresh token:", error)
				// Only clear secrets when the refresh token is clearly invalid/revoked.
				if (error instanceof OpenAiCodexOAuthTokenError && error.isLikelyInvalidGrant()) {
					this.log("[openai-codex-oauth] Refresh token appears invalid; clearing stored credentials")
					await this.clearCredentials()
				}
				return null
			}
		}
		return this.credentials.access_token
	}
	/**
	 * Get the user's email from credentials
	 */
	async getEmail() {
		if (!this.credentials) {
			await this.loadCredentials()
		}
		return this.credentials?.email || null
	}
	/**
	 * Get the ChatGPT account ID from credentials
	 * Used for the ChatGPT-Account-Id header required by the Codex API
	 */
	async getAccountId() {
		if (!this.credentials) {
			await this.loadCredentials()
		}
		return this.credentials?.accountId || null
	}
	/**
	 * Check if the user is authenticated
	 */
	async isAuthenticated() {
		const token = await this.getAccessToken()
		return token !== null
	}
	/**
	 * Start the OAuth authorization flow
	 * Returns the authorization URL to open in browser
	 */
	startAuthorizationFlow() {
		// Cancel any existing authorization flow before starting a new one
		this.cancelAuthorizationFlow()
		const codeVerifier = generateCodeVerifier()
		const codeChallenge = generateCodeChallenge(codeVerifier)
		const state = generateState()
		this.pendingAuth = {
			codeVerifier,
			state,
		}
		return buildAuthorizationUrl(codeChallenge, state)
	}
	/**
	 * Start a local server to receive the OAuth callback
	 * Returns a promise that resolves when authentication is complete
	 */
	async waitForCallback() {
		if (!this.pendingAuth) {
			throw new Error("No pending authorization flow")
		}
		// Close any existing server before starting a new one
		if (this.pendingAuth.server) {
			try {
				this.pendingAuth.server.close()
			} catch {
				// Ignore errors when closing
			}
			this.pendingAuth.server = undefined
		}
		return new Promise((resolve, reject) => {
			const server = http.createServer(async (req, res) => {
				try {
					const url = new url_1.URL(
						req.url || "",
						`http://localhost:${exports.OPENAI_CODEX_OAUTH_CONFIG.callbackPort}`,
					)
					if (url.pathname !== "/auth/callback") {
						res.writeHead(404)
						res.end("Not Found")
						return
					}
					const code = url.searchParams.get("code")
					const state = url.searchParams.get("state")
					const error = url.searchParams.get("error")
					if (error) {
						res.writeHead(400)
						res.end(`Authentication failed: ${error}`)
						reject(new Error(`OAuth error: ${error}`))
						server.close()
						return
					}
					if (!code || !state) {
						res.writeHead(400)
						res.end("Missing code or state parameter")
						reject(new Error("Missing code or state parameter"))
						server.close()
						return
					}
					if (state !== this.pendingAuth?.state) {
						res.writeHead(400)
						res.end("State mismatch - possible CSRF attack")
						reject(new Error("State mismatch"))
						server.close()
						return
					}
					try {
						// Note: state is validated above but not passed to exchangeCodeForTokens
						// per the implementation guide (OpenAI rejects it)
						const credentials = await exchangeCodeForTokens(code, this.pendingAuth.codeVerifier)
						await this.saveCredentials(credentials)
						res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
						res.end(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Authentication Successful</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background: linear-gradient(135deg, #10a37f 0%, #0d8f6f 100%);
    color: white;
  }
  .container {
    text-align: center;
    padding: 2rem;
  }
  h1 { font-size: 2rem; margin-bottom: 1rem; }
  p { opacity: 0.9; }
</style>
</head>
<body>
<div class="container">
<h1>&#10003; Authentication Successful</h1>
<p>You can close this window and return to VS Code.</p>
</div>
<script>setTimeout(() => window.close(), 3000);</script>
</body>
</html>`)
						this.pendingAuth = null
						server.close()
						resolve(credentials)
					} catch (exchangeError) {
						res.writeHead(500)
						res.end(`Token exchange failed: ${exchangeError}`)
						reject(exchangeError)
						server.close()
					}
				} catch (err) {
					res.writeHead(500)
					res.end("Internal server error")
					reject(err)
					server.close()
				}
			})
			server.on("error", (err) => {
				this.pendingAuth = null
				if (err.code === "EADDRINUSE") {
					reject(
						new Error(
							`Port ${exports.OPENAI_CODEX_OAUTH_CONFIG.callbackPort} is already in use. ` +
								`Please close any other applications using this port and try again.`,
						),
					)
				} else {
					reject(err)
				}
			})
			// Set a timeout for the callback
			const timeout = setTimeout(
				() => {
					server.close()
					reject(new Error("Authentication timed out"))
				},
				5 * 60 * 1000,
			) // 5 minutes
			server.listen(exports.OPENAI_CODEX_OAUTH_CONFIG.callbackPort, () => {
				if (this.pendingAuth) {
					this.pendingAuth.server = server
				}
			})
			// Clear timeout when server closes
			server.on("close", () => {
				clearTimeout(timeout)
			})
		})
	}
	/**
	 * Cancel any pending authorization flow
	 */
	cancelAuthorizationFlow() {
		if (this.pendingAuth?.server) {
			this.pendingAuth.server.close()
		}
		this.pendingAuth = null
	}
	/**
	 * Get the current credentials (for display purposes)
	 */
	getCredentials() {
		return this.credentials
	}
}
exports.OpenAiCodexOAuthManager = OpenAiCodexOAuthManager
// Singleton instance
exports.openAiCodexOAuthManager = new OpenAiCodexOAuthManager()
