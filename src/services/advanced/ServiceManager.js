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
exports.SERVICE_STATE_CHANGED = exports.ServiceManager = void 0
const vscode = __importStar(require("vscode"))
const core_1 = require("@ali-code/core")
const core_2 = require("@ali-code/core")
const logger = new core_1.DebugLogger("advanced-services")
/**
 * ServiceManager owns the lifecycle of advanced runtime services
 * and exposes them to the extension host.
 *
 * This services layer sits between the VS Code extension host and
 * the core packages, providing a single point for configuring
 * memory recall, browser automation, image processing, and
 * sandbox confinement.
 */
class ServiceManager {
	memory = core_2.memoryService
	browser = core_2.browserService
	imageProcessing = core_2.imageProcessingService
	sandbox = core_2.sandboxService
	_context
	_ready = false
	constructor(context) {
		this._context = context
	}
	/**
	 * Synchronize settings from ContextProxy into each service.
	 * Called by ClineProvider on state-changed events and at startup.
	 */
	async syncSettings(config) {
		// Apply memory settings
		if (config.memorySettings) {
			this.memory.updateSettings(config.memorySettings)
			const enabled = this.memory.getSettings().enabled
			if (enabled) {
				const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
				if (root) {
					await this.memory.initialize(root)
				}
			} else {
				this.memory.disable()
			}
		}
		// Apply browser settings
		if (config.browserAutomationSettings) {
			this.browser.updateSettings(config.browserAutomationSettings)
		}
		// Apply sandbox settings
		if (config.sandboxPolicy) {
			this.sandbox.updatePolicy(config.sandboxPolicy)
		}
		this._ready = true
		logger.info("Advanced services settings synchronized")
	}
	/** Whether all services are synchronized and ready. */
	isReady() {
		return this._ready
	}
	/**
	 * Get snapshot of all service states for the SettingsView.
	 */
	getServiceStates() {
		return {
			memory: this.memory.getState(),
			memorySettings: this.memory.getSettings(),
			browserEnabled: this.browser.isEnabled(),
			sandbox: this.sandbox.getStatus(),
		}
	}
}
exports.ServiceManager = ServiceManager
/** Kept as a string literal because the name may be used as a discriminator. */
exports.SERVICE_STATE_CHANGED = "alicode.serviceStateChanged"
