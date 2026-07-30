"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const os_1 = __importDefault(require("os"))
// Mock the modules - must be hoisted before imports
vi.mock("os-name", () => ({
	default: vi.fn(),
}))
vi.mock("../../../../utils/shell", () => ({
	getShell: vi.fn(() => "/bin/bash"),
}))
const system_info_1 = require("../system-info")
const os_name_1 = __importDefault(require("os-name"))
const mockOsName = os_name_1.default
describe("getSystemInfoSection", () => {
	const mockCwd = "/test/workspace"
	const mockHomeDir = "/home/user"
	beforeEach(() => {
		vi.spyOn(os_1.default, "homedir").mockReturnValue(mockHomeDir)
		vi.spyOn(os_1.default, "platform").mockReturnValue("linux")
		vi.spyOn(os_1.default, "release").mockReturnValue("5.15.0")
	})
	afterEach(() => {
		vi.clearAllMocks()
	})
	it("should return system info with os-name when available", () => {
		mockOsName.mockReturnValue("Ubuntu 22.04")
		const result = (0, system_info_1.getSystemInfoSection)(mockCwd)
		expect(result).toContain("Operating System: Ubuntu 22.04")
		expect(result).toContain("Default Shell: /bin/bash")
		expect(result).toContain(`Home Directory: ${mockHomeDir}`)
		expect(result).toContain(`Current Workspace Directory: ${mockCwd}`)
	})
	it("should fallback to platform and release when os-name throws error", () => {
		mockOsName.mockImplementation(() => {
			throw new Error("Command failed with ENOENT: powershell")
		})
		const result = (0, system_info_1.getSystemInfoSection)(mockCwd)
		expect(result).toContain("Operating System: linux 5.15.0")
		expect(result).toContain("Default Shell: /bin/bash")
		expect(result).toContain(`Home Directory: ${mockHomeDir}`)
		expect(result).toContain(`Current Workspace Directory: ${mockCwd}`)
	})
	it("should handle Windows platform in fallback", () => {
		mockOsName.mockImplementation(() => {
			throw new Error("Command failed with ENOENT: powershell")
		})
		vi.spyOn(os_1.default, "platform").mockReturnValue("win32")
		vi.spyOn(os_1.default, "release").mockReturnValue("10.0.19043")
		const result = (0, system_info_1.getSystemInfoSection)(mockCwd)
		expect(result).toContain("Operating System: win32 10.0.19043")
	})
})
