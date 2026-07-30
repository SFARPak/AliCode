"use strict"
// npx vitest core/mentions/__tests__/index.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const index_1 = require("../index")
// Mock vscode
vi.mock("vscode", () => ({
	window: {
		showErrorMessage: vi.fn(),
	},
}))
// Mock i18n
vi.mock("../../../i18n", () => ({
	t: vi.fn((key) => key),
}))
describe("parseMentions - URL mention handling", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})
	it("should replace URL mentions with quoted URL reference", async () => {
		const result = await (0, index_1.parseMentions)("Check @https://example.com", "/test")
		// URL mentions are now replaced with a quoted reference (no fetching)
		expect(result.text).toContain("'https://example.com'")
	})
})
