"use strict"
// Wrapper for AgentManagerProvider from kilo-vscode source
// Adjusted to accept a VS Code extension URI instead of a Host, providing a minimal
// Host implementation required for tests and activation.
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
exports.AgentManagerProvider = void 0
const vscode = __importStar(require("vscode"))
const AgentManagerProvider_1 = require("../../kilocode_tmp/packages/kilo-vscode/src/agent-manager/AgentManagerProvider")
// Minimal Host stub providing only the methods used during tests/activation.
class MinimalHost {
	// The original provider expects a createOutput method returning an OutputChannel.
	createOutput(name) {
		return vscode.window.createOutputChannel(name)
	}
	// Stub methods to satisfy the Host interface; they are no-ops for the test environment.
	openDocument(_file) {
		/* no-op */
	}
	autoBranchNaming() {
		return undefined
	}
	openExternal(_uri) {
		/* no-op */
	}
	// Provide a workspacePath method to satisfy Host interface used in tests.
	workspacePath() {
		return undefined
	}
}
class AgentManagerProvider extends AgentManagerProvider_1.AgentManagerProvider {
	constructor(extensionUri, connectionService) {
		// Provide a MinimalHost instance to the original constructor.
		const host = new MinimalHost()
		super(host, connectionService)
	}
}
exports.AgentManagerProvider = AgentManagerProvider
