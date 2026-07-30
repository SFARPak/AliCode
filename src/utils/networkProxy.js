"use strict"
/**
 * Network Proxy Configuration Module
 *
 * Provides proxy configuration for all outbound HTTP/HTTPS requests from the AliCode extension.
 * When running in debug mode (F5), a proxy can be enabled for outbound traffic.
 * Optionally, TLS certificate verification can be disabled (debug only) to allow
 * MITM proxy inspection.
 *
 * Uses global-agent to globally route all HTTP/HTTPS traffic through the proxy,
 * which works with axios, fetch, and most SDKs that use native Node.js http/https.
 */
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
exports.initializeNetworkProxy = initializeNetworkProxy
exports.getProxyConfig = getProxyConfig
exports.isProxyEnabled = isProxyEnabled
exports.isDebugMode = isDebugMode
const vscode = __importStar(require("vscode"))
const package_1 = require("../shared/package")
let extensionContext = null
let proxyInitialized = false
let undiciProxyInitialized = false
let fetchPatched = false
let originalFetch
let outputChannel = null
let loggingEnabled = false
let consoleLoggingEnabled = false
let tlsVerificationOverridden = false
let originalNodeTlsRejectUnauthorized
function redactProxyUrl(proxyUrl) {
	if (!proxyUrl) {
		return "(not set)"
	}
	try {
		const url = new URL(proxyUrl)
		url.username = ""
		url.password = ""
		return url.toString()
	} catch {
		// Fallback for invalid URLs: redact basic auth if present.
		return proxyUrl.replace(/\/\/[^@/]+@/g, "//REDACTED@")
	}
}
function restoreGlobalFetchPatch() {
	if (!fetchPatched) {
		return
	}
	if (originalFetch) {
		globalThis.fetch = originalFetch
	}
	fetchPatched = false
	originalFetch = undefined
}
function restoreTlsVerificationOverride() {
	if (!tlsVerificationOverridden) {
		return
	}
	if (typeof originalNodeTlsRejectUnauthorized === "string") {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalNodeTlsRejectUnauthorized
	} else {
		delete process.env.NODE_TLS_REJECT_UNAUTHORIZED
	}
	tlsVerificationOverridden = false
	originalNodeTlsRejectUnauthorized = undefined
}
function applyTlsVerificationOverride(config) {
	// Only relevant in debug mode with an active proxy.
	if (!config.isDebugMode || !config.enabled) {
		restoreTlsVerificationOverride()
		return
	}
	if (!config.tlsInsecure) {
		restoreTlsVerificationOverride()
		return
	}
	if (!tlsVerificationOverridden) {
		originalNodeTlsRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED
	}
	// CodeQL: debug-only opt-in for MITM debugging.
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" // lgtm[js/disabling-certificate-validation]
	tlsVerificationOverridden = true
}
/**
 * Initialize the network proxy module with the extension context.
 * Must be called early in extension activation before any network requests.
 *
 * @param context The VS Code extension context
 * @param channel Optional output channel for logging
 */
async function initializeNetworkProxy(context, channel) {
	extensionContext = context
	// extensionMode is immutable for the process lifetime - exit early if not in debug mode.
	// This avoids any overhead (listeners, logging, etc.) in production.
	const isDebugMode = context.extensionMode === vscode.ExtensionMode.Development
	if (!isDebugMode) {
		return
	}
	outputChannel = channel ?? null
	loggingEnabled = true
	consoleLoggingEnabled = !outputChannel
	const config = getProxyConfig()
	log(`Initializing network proxy module...`)
	log(
		`Proxy config: enabled=${config.enabled}, serverUrl=${redactProxyUrl(config.serverUrl)}, tlsInsecure=${config.tlsInsecure}`,
	)
	// Listen for configuration changes to allow toggling proxy during a debug session.
	// Guard for test environments where onDidChangeConfiguration may not be mocked.
	if (typeof vscode.workspace.onDidChangeConfiguration === "function") {
		context.subscriptions.push(
			vscode.workspace.onDidChangeConfiguration((e) => {
				if (
					e.affectsConfiguration(`${package_1.Package.name}.debugProxy.enabled`) ||
					e.affectsConfiguration(`${package_1.Package.name}.debugProxy.serverUrl`) ||
					e.affectsConfiguration(`${package_1.Package.name}.debugProxy.tlsInsecure`)
				) {
					const newConfig = getProxyConfig()
					if (newConfig.enabled) {
						applyTlsVerificationOverride(newConfig)
						configureGlobalProxy(newConfig)
						configureUndiciProxy(newConfig)
					} else {
						// Proxy disabled - but we can't easily un-bootstrap global-agent or reset undici dispatcher safely.
						// We *can* restore any global fetch patch immediately.
						restoreGlobalFetchPatch()
						restoreTlsVerificationOverride()
						log("Debug proxy disabled. Restart VS Code to fully disable proxy routing.")
					}
				}
			}),
		)
	}
	// Ensure we restore any overrides when the extension unloads.
	context.subscriptions.push({
		dispose: () => {
			restoreGlobalFetchPatch()
			restoreTlsVerificationOverride()
		},
	})
	if (config.enabled) {
		applyTlsVerificationOverride(config)
		await configureGlobalProxy(config)
		await configureUndiciProxy(config)
	} else {
		log(`Debug proxy not enabled.`)
	}
}
/**
 * Get the current proxy configuration based on VS Code settings and extension mode.
 */
function getProxyConfig() {
	const defaultServerUrl = "http://127.0.0.1:8888"
	if (!extensionContext) {
		// Fallback if called before initialization
		return {
			enabled: false,
			serverUrl: defaultServerUrl,
			tlsInsecure: false,
			isDebugMode: false,
		}
	}
	const config = vscode.workspace.getConfiguration(package_1.Package.name)
	const enabled = Boolean(config.get("debugProxy.enabled"))
	const rawServerUrl = config.get("debugProxy.serverUrl")
	const serverUrl = typeof rawServerUrl === "string" && rawServerUrl.trim() ? rawServerUrl.trim() : defaultServerUrl
	const tlsInsecure = Boolean(config.get("debugProxy.tlsInsecure"))
	// Debug mode only.
	const isDebugMode = extensionContext.extensionMode === vscode.ExtensionMode.Development
	return {
		enabled,
		serverUrl,
		tlsInsecure,
		isDebugMode,
	}
}
/**
 * Configure global-agent to route all HTTP/HTTPS traffic through the proxy.
 */
async function configureGlobalProxy(config) {
	if (proxyInitialized) {
		// global-agent can only be bootstrapped once
		// Update environment variables for any new connections
		log(`Proxy already initialized, updating env vars only`)
		updateProxyEnvVars(config)
		return
	}
	// Set up environment variables before bootstrapping
	log(`Setting proxy environment variables before bootstrap (values redacted)...`)
	updateProxyEnvVars(config)
	let bootstrap
	try {
		const mod = await import("global-agent")
		bootstrap = mod.bootstrap
	} catch (error) {
		log(
			`Failed to load global-agent (proxy support is only available in debug/dev builds): ${error instanceof Error ? error.message : String(error)}`,
		)
		return
	}
	// Bootstrap global-agent to intercept all HTTP/HTTPS requests
	log(`Calling global-agent bootstrap()...`)
	try {
		bootstrap()
		proxyInitialized = true
		log(`global-agent bootstrap() completed successfully`)
	} catch (error) {
		log(`global-agent bootstrap() FAILED: ${error instanceof Error ? error.message : String(error)}`)
		return
	}
	log(`Network proxy configured: ${redactProxyUrl(config.serverUrl)}`)
}
/**
 * Configure undici's global dispatcher so Node's built-in `fetch()` and any undici-based
 * clients route through the proxy.
 */
async function configureUndiciProxy(config) {
	if (!config.enabled || !config.serverUrl) {
		return
	}
	if (undiciProxyInitialized) {
		log(`undici global dispatcher already configured; restart VS Code to change proxy safely`)
		return
	}
	try {
		const { ProxyAgent, setGlobalDispatcher, fetch: undiciFetch } = await import("undici")
		const proxyAgent = new ProxyAgent({
			uri: config.serverUrl,
			// If the user enabled TLS insecure mode (debug only), apply it to undici.
			requestTls: config.tlsInsecure
				? { rejectUnauthorized: false } // lgtm[js/disabling-certificate-validation]
				: undefined,
			proxyTls: config.tlsInsecure
				? { rejectUnauthorized: false } // lgtm[js/disabling-certificate-validation]
				: undefined,
		})
		setGlobalDispatcher(proxyAgent)
		undiciProxyInitialized = true
		log(`undici global dispatcher configured for proxy: ${redactProxyUrl(config.serverUrl)}`)
		// Node's built-in `fetch()` (Node 18+) is powered by an internal undici copy.
		// Setting a dispatcher on our `undici` dependency does NOT affect that internal fetch.
		// To ensure AliCode's `fetch()` calls are proxied, patch global fetch in debug mode.
		// This patch is scoped to the extension lifecycle (restored on deactivate) and can be restored
		// immediately if the proxy is disabled.
		if (!fetchPatched) {
			if (typeof globalThis.fetch === "function") {
				originalFetch = globalThis.fetch
			}
			globalThis.fetch = undiciFetch
			fetchPatched = true
			log(`globalThis.fetch patched to undici.fetch (debug proxy mode)`)
			if (extensionContext) {
				extensionContext.subscriptions.push({
					dispose: () => restoreGlobalFetchPatch(),
				})
			}
		}
	} catch (error) {
		log(`Failed to configure undici proxy dispatcher: ${error instanceof Error ? error.message : String(error)}`)
	}
}
/**
 * Update environment variables for proxy configuration.
 * global-agent reads from GLOBAL_AGENT_* environment variables.
 */
function updateProxyEnvVars(config) {
	if (config.serverUrl) {
		// global-agent uses these environment variables
		process.env.GLOBAL_AGENT_HTTP_PROXY = config.serverUrl
		process.env.GLOBAL_AGENT_HTTPS_PROXY = config.serverUrl
		process.env.GLOBAL_AGENT_NO_PROXY = "" // Proxy all requests
	}
}
/**
 * Check if a proxy is currently configured and active.
 */
function isProxyEnabled() {
	const config = getProxyConfig()
	// Active proxy is only applied in debug mode.
	return config.enabled && config.isDebugMode
}
/**
 * Check if we're running in debug mode.
 */
function isDebugMode() {
	if (!extensionContext) {
		return false
	}
	return extensionContext.extensionMode === vscode.ExtensionMode.Development
}
/**
 * Log a message to the output channel if available.
 */
function log(message) {
	if (!loggingEnabled) {
		return
	}
	const logMessage = `[NetworkProxy] ${message}`
	if (outputChannel) {
		outputChannel.appendLine(logMessage)
	}
	if (consoleLoggingEnabled) {
		console.log(logMessage)
	}
}
