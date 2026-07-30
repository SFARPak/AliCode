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
exports.generateSystemPrompt = void 0
const vscode = __importStar(require("vscode"))
const modes_1 = require("../../shared/modes")
const api_1 = require("../../api")
const system_1 = require("../prompts/system")
const multi_search_replace_1 = require("../diff/strategies/multi-search-replace")
const package_1 = require("../../shared/package")
const generateSystemPrompt = async (provider, message) => {
	const {
		apiConfiguration,
		customModePrompts,
		customInstructions,
		mcpEnabled,
		experiments,
		language,
		enableSubfolderRules,
	} = await provider.getState()
	const diffStrategy = new multi_search_replace_1.MultiSearchReplaceDiffStrategy()
	const cwd = provider.cwd
	const mode = message.mode ?? modes_1.defaultModeSlug
	const customModes = await provider.customModesManager.getCustomModes()
	const rooIgnoreInstructions = provider.getCurrentTask()?.aliIgnoreController?.getInstructions()
	// Create a temporary API handler to check model info for stealth mode.
	// This avoids relying on an active Cline instance which might not exist during preview.
	let modelInfo
	try {
		const tempApiHandler = (0, api_1.buildApiHandler)(apiConfiguration)
		modelInfo = tempApiHandler.getModel().info
	} catch (error) {
		console.error("Error fetching model info for system prompt preview:", error)
	}
	const systemPrompt = await (0, system_1.SYSTEM_PROMPT)(
		provider.context,
		cwd,
		false, // supportsComputerUse — browser removed
		mcpEnabled ? provider.getMcpHub() : undefined,
		diffStrategy,
		mode,
		customModePrompts,
		customModes,
		customInstructions,
		experiments,
		language,
		rooIgnoreInstructions,
		{
			todoListEnabled: apiConfiguration?.todoListEnabled ?? true,
			useAgentRules: vscode.workspace.getConfiguration(package_1.Package.name).get("useAgentRules") ?? true,
			enableSubfolderRules: enableSubfolderRules ?? false,
			newTaskRequireTodos: vscode.workspace
				.getConfiguration(package_1.Package.name)
				.get("newTaskRequireTodos", false),
			isStealthModel: modelInfo?.isStealthModel,
		},
		undefined, // todoList
		undefined, // modelId
		provider.getSkillsManager(),
	)
	return systemPrompt
}
exports.generateSystemPrompt = generateSystemPrompt
