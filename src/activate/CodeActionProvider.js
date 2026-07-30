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
exports.CodeActionProvider = exports.TITLES = void 0
const vscode = __importStar(require("vscode"))
const package_1 = require("../shared/package")
const commands_1 = require("../utils/commands")
const EditorUtils_1 = require("../integrations/editor/EditorUtils")
exports.TITLES = {
	EXPLAIN: "Explain with AliCode",
	FIX: "Fix with AliCode",
	IMPROVE: "Improve with AliCode",
	ADD_TO_CONTEXT: "Add to AliCode",
	NEW_TASK: "New AliCode Task",
}
class CodeActionProvider {
	static providedCodeActionKinds = [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite]
	createAction(title, kind, command, args) {
		const action = new vscode.CodeAction(title, kind)
		action.command = { command: (0, commands_1.getCodeActionCommand)(command), title, arguments: args }
		return action
	}
	provideCodeActions(document, range, context) {
		try {
			if (!vscode.workspace.getConfiguration(package_1.Package.name).get("enableCodeActions", true)) {
				return []
			}
			const effectiveRange = EditorUtils_1.EditorUtils.getEffectiveRange(document, range)
			if (!effectiveRange) {
				return []
			}
			const filePath = EditorUtils_1.EditorUtils.getFilePath(document)
			const actions = []
			actions.push(
				this.createAction(exports.TITLES.ADD_TO_CONTEXT, vscode.CodeActionKind.QuickFix, "addToContext", [
					filePath,
					effectiveRange.text,
					effectiveRange.range.start.line + 1,
					effectiveRange.range.end.line + 1,
				]),
			)
			if (context.diagnostics.length > 0) {
				const relevantDiagnostics = context.diagnostics.filter((d) =>
					EditorUtils_1.EditorUtils.hasIntersectingRange(effectiveRange.range, d.range),
				)
				if (relevantDiagnostics.length > 0) {
					actions.push(
						this.createAction(exports.TITLES.FIX, vscode.CodeActionKind.QuickFix, "fixCode", [
							filePath,
							effectiveRange.text,
							effectiveRange.range.start.line + 1,
							effectiveRange.range.end.line + 1,
							relevantDiagnostics.map(EditorUtils_1.EditorUtils.createDiagnosticData),
						]),
					)
				}
			} else {
				actions.push(
					this.createAction(exports.TITLES.EXPLAIN, vscode.CodeActionKind.QuickFix, "explainCode", [
						filePath,
						effectiveRange.text,
						effectiveRange.range.start.line + 1,
						effectiveRange.range.end.line + 1,
					]),
				)
				actions.push(
					this.createAction(exports.TITLES.IMPROVE, vscode.CodeActionKind.QuickFix, "improveCode", [
						filePath,
						effectiveRange.text,
						effectiveRange.range.start.line + 1,
						effectiveRange.range.end.line + 1,
					]),
				)
			}
			return actions
		} catch (error) {
			console.error("Error providing code actions:", error)
			return []
		}
	}
}
exports.CodeActionProvider = CodeActionProvider
