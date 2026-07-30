"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.createChunkedMockStream =
	exports.createPowerShellMockStream =
	exports.createCmdMockStream =
	exports.createBashMockStream =
	exports.createBaseMockStream =
	exports.createPowerShellStream =
	exports.createCmdCommandStream =
	exports.createBashCommandStream =
		void 0
exports.isPowerShellCoreAvailable = isPowerShellCoreAvailable
exports.getPlatform = getPlatform
exports.isWindows = isWindows
// streamUtils/index.ts
const bashStream_1 = require("./bashStream")
Object.defineProperty(exports, "createBashCommandStream", {
	enumerable: true,
	get: function () {
		return bashStream_1.createBashCommandStream
	},
})
const cmdStream_1 = require("./cmdStream")
Object.defineProperty(exports, "createCmdCommandStream", {
	enumerable: true,
	get: function () {
		return cmdStream_1.createCmdCommandStream
	},
})
const pwshStream_1 = require("./pwshStream")
Object.defineProperty(exports, "createPowerShellStream", {
	enumerable: true,
	get: function () {
		return pwshStream_1.createPowerShellStream
	},
})
const mockStream_1 = require("./mockStream")
Object.defineProperty(exports, "createBaseMockStream", {
	enumerable: true,
	get: function () {
		return mockStream_1.createBaseMockStream
	},
})
Object.defineProperty(exports, "createBashMockStream", {
	enumerable: true,
	get: function () {
		return mockStream_1.createBashMockStream
	},
})
Object.defineProperty(exports, "createCmdMockStream", {
	enumerable: true,
	get: function () {
		return mockStream_1.createCmdMockStream
	},
})
Object.defineProperty(exports, "createPowerShellMockStream", {
	enumerable: true,
	get: function () {
		return mockStream_1.createPowerShellMockStream
	},
})
Object.defineProperty(exports, "createChunkedMockStream", {
	enumerable: true,
	get: function () {
		return mockStream_1.createChunkedMockStream
	},
})
/**
 * Check if PowerShell Core (pwsh) is available on the system
 * @returns Boolean indicating whether pwsh is available
 */
function isPowerShellCoreAvailable() {
	return global.__TEST_ENV__?.isPowerShellAvailable || false
}
/**
 * Get the current platform
 * @returns The current platform: 'win32', 'darwin', 'linux', etc.
 */
function getPlatform() {
	return global.__TEST_ENV__?.platform || process.platform
}
/**
 * Check if the current platform is Windows
 * @returns Boolean indicating whether the current platform is Windows
 */
function isWindows() {
	return getPlatform() === "win32"
}
