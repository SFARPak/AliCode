"use strict"
// npx vitest run core/webview/__tests__/webviewMessageHandler.lockApiConfig.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const webviewMessageHandler_1 = require("../webviewMessageHandler")
describe("webviewMessageHandler - lockApiConfigAcrossModes", () => {
	let mockProvider
	beforeEach(() => {
		vi.clearAllMocks()
		mockProvider = {
			context: {
				workspaceState: {
					get: vi.fn(),
					update: vi.fn().mockResolvedValue(undefined),
				},
			},
			getState: vi.fn().mockResolvedValue({
				currentApiConfigName: "test-config",
				listApiConfigMeta: [{ name: "test-config", id: "config-123" }],
				customModes: [],
			}),
			postStateToWebview: vi.fn(),
			providerSettingsManager: {
				setModeConfig: vi.fn(),
			},
			postMessageToWebview: vi.fn(),
			getCurrentTask: vi.fn(),
		}
	})
	it("sets lockApiConfigAcrossModes to true and posts state without mode config fan-out", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "lockApiConfigAcrossModes",
			bool: true,
		})
		expect(mockProvider.context.workspaceState.update).toHaveBeenCalledWith("lockApiConfigAcrossModes", true)
		expect(mockProvider.providerSettingsManager.setModeConfig).not.toHaveBeenCalled()
		expect(mockProvider.postStateToWebview).toHaveBeenCalled()
	})
	it("sets lockApiConfigAcrossModes to false without applying to all modes", async () => {
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockProvider, {
			type: "lockApiConfigAcrossModes",
			bool: false,
		})
		expect(mockProvider.context.workspaceState.update).toHaveBeenCalledWith("lockApiConfigAcrossModes", false)
		expect(mockProvider.providerSettingsManager.setModeConfig).not.toHaveBeenCalled()
		expect(mockProvider.postStateToWebview).toHaveBeenCalled()
	})
})
