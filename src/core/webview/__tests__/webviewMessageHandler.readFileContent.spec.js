"use strict"
// npx vitest core/webview/__tests__/webviewMessageHandler.readFileContent.spec.ts
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
const vitest_1 = require("vitest")
vitest_1.vi.mock("../../../api/providers/fetchers/modelCache")
vitest_1.vi.mock("vscode", () => ({
	window: {
		showInformationMessage: vitest_1.vi.fn(),
		showErrorMessage: vitest_1.vi.fn(),
		showTextDocument: vitest_1.vi.fn(),
	},
	workspace: {
		workspaceFolders: [{ uri: { fsPath: "/mock/workspace" } }],
		openTextDocument: vitest_1.vi.fn().mockResolvedValue({}),
	},
}))
vitest_1.vi.mock("../../../i18n", () => ({
	t: vitest_1.vi.fn((key) => key),
}))
vitest_1.vi.mock("fs/promises", () => {
	const readFile = vitest_1.vi.fn().mockResolvedValue("file content here")
	return {
		default: {
			rm: vitest_1.vi.fn(),
			mkdir: vitest_1.vi.fn(),
			readFile,
			writeFile: vitest_1.vi.fn(),
		},
		rm: vitest_1.vi.fn(),
		mkdir: vitest_1.vi.fn(),
		readFile,
		writeFile: vitest_1.vi.fn(),
	}
})
vitest_1.vi.mock("../../../utils/fs")
vitest_1.vi.mock("../../../utils/path")
vitest_1.vi.mock("../../../utils/globalContext")
vitest_1.vi.mock("../../../utils/pathUtils", () => ({
	isPathOutsideWorkspace: vitest_1.vi.fn((filePath) => {
		const nodePath = require("path")
		const normalized = nodePath.resolve(filePath)
		const workspaceRoot = nodePath.resolve("/mock/workspace")
		// Path is inside workspace if it equals or is under workspace root
		if (normalized === workspaceRoot) return false
		if (normalized.startsWith(workspaceRoot + nodePath.sep)) return false
		return true
	}),
}))
vitest_1.vi.mock("../../mentions/resolveImageMentions", () => ({
	resolveImageMentions: vitest_1.vi.fn(async ({ text, images }) => ({
		text,
		images: [...(images ?? [])],
	})),
}))
const webviewMessageHandler_1 = require("../webviewMessageHandler")
const fs = __importStar(require("fs/promises"))
const MOCK_CWD = "/mock/workspace/project"
const mockProvider = {
	getState: vitest_1.vi.fn(),
	postMessageToWebview: vitest_1.vi.fn(),
	customModesManager: {
		getCustomModes: vitest_1.vi.fn(),
		deleteCustomMode: vitest_1.vi.fn(),
	},
	context: {
		extensionPath: "/mock/extension/path",
		globalStorageUri: { fsPath: "/mock/global/storage" },
	},
	contextProxy: {
		context: {
			extensionPath: "/mock/extension/path",
			globalStorageUri: { fsPath: "/mock/global/storage" },
		},
		setValue: vitest_1.vi.fn(),
		getValue: vitest_1.vi.fn(),
	},
	log: vitest_1.vi.fn(),
	postStateToWebview: vitest_1.vi.fn(),
	getCurrentTask: vitest_1.vi.fn().mockReturnValue({ cwd: MOCK_CWD }),
	getTaskWithId: vitest_1.vi.fn(),
	createTaskWithHistoryItem: vitest_1.vi.fn(),
	cwd: MOCK_CWD,
}
;(0, vitest_1.describe)("webviewMessageHandler - readFileContent path traversal prevention", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		vitest_1.vi.mocked(fs.readFile).mockResolvedValue("file content here")
		vitest_1.vi.mocked(mockProvider.getCurrentTask).mockReturnValue({ cwd: MOCK_CWD })
	})
	;(0, vitest_1.it)("allows reading a file within the workspace using a relative path", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "readFileContent",
			text: "src/index.ts",
		})
		;(0, vitest_1.expect)(fs.readFile).toHaveBeenCalled()
		;(0, vitest_1.expect)(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				type: "fileContent",
				fileContent: vitest_1.expect.objectContaining({
					path: "src/index.ts",
					content: "file content here",
				}),
			}),
		)
	})
	;(0, vitest_1.it)("blocks path traversal with ../", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "readFileContent",
			text: "../../../etc/passwd",
		})
		;(0, vitest_1.expect)(fs.readFile).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				type: "fileContent",
				fileContent: vitest_1.expect.objectContaining({
					path: "../../../etc/passwd",
					content: null,
					error: "Path is outside workspace",
				}),
			}),
		)
	})
	;(0, vitest_1.it)("blocks absolute paths outside the workspace", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "readFileContent",
			text: "/etc/shadow",
		})
		;(0, vitest_1.expect)(fs.readFile).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				type: "fileContent",
				fileContent: vitest_1.expect.objectContaining({
					path: "/etc/shadow",
					content: null,
					error: "Path is outside workspace",
				}),
			}),
		)
	})
	;(0, vitest_1.it)("blocks traversal disguised in the middle of a path", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "readFileContent",
			text: "src/../../../../etc/passwd",
		})
		;(0, vitest_1.expect)(fs.readFile).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				type: "fileContent",
				fileContent: vitest_1.expect.objectContaining({
					content: null,
					error: "Path is outside workspace",
				}),
			}),
		)
	})
	;(0, vitest_1.it)("returns error when no path is provided", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "readFileContent",
			text: "",
		})
		;(0, vitest_1.expect)(fs.readFile).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				type: "fileContent",
				fileContent: vitest_1.expect.objectContaining({
					content: null,
					error: "No path provided",
				}),
			}),
		)
	})
	;(0, vitest_1.it)("allows reading a file using an absolute path within the workspace", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "readFileContent",
			text: `${MOCK_CWD}/src/index.ts`,
		})
		;(0, vitest_1.expect)(fs.readFile).toHaveBeenCalled()
		;(0, vitest_1.expect)(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			vitest_1.expect.objectContaining({
				type: "fileContent",
				fileContent: vitest_1.expect.objectContaining({
					content: "file content here",
				}),
			}),
		)
	})
})
