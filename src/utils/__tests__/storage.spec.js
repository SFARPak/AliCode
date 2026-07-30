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
const vscode = __importStar(require("vscode"))
vi.mock("fs/promises", async () => {
	const mod = await import("../../__mocks__/fs/promises")
	return mod.default ?? mod
})
describe("getStorageBasePath - customStoragePath", () => {
	const defaultPath = "/test/global-storage"
	beforeEach(() => {
		vi.clearAllMocks()
	})
	afterEach(() => {
		vi.restoreAllMocks()
	})
	it("returns the configured custom path when it is writable", async () => {
		const customPath = "/test/storage/path"
		vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
			get: vi.fn().mockReturnValue(customPath),
		})
		const fsPromises = await import("fs/promises")
		const { getStorageBasePath } = await import("../storage")
		const result = await getStorageBasePath(defaultPath)
		expect(result).toBe(customPath)
		expect(fsPromises.mkdir).toHaveBeenCalledWith(customPath, { recursive: true })
		expect(fsPromises.access).toHaveBeenCalledWith(customPath, 7) // 7 = R_OK(4) | W_OK(2) | X_OK(1)
	})
	it("falls back to default and shows an error when custom path is not writable", async () => {
		const customPath = "/test/storage/unwritable"
		vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
			get: vi.fn().mockReturnValue(customPath),
		})
		const showErrorSpy = vi.spyOn(vscode.window, "showErrorMessage").mockResolvedValue(undefined)
		const fsPromises = await import("fs/promises")
		const { getStorageBasePath } = await import("../storage")
		await fsPromises.mkdir(customPath, { recursive: true })
		const accessMock = fsPromises.access
		accessMock.mockImplementationOnce(async (p) => {
			if (p === customPath) {
				const err = new Error("EACCES: permission denied")
				err.code = "EACCES"
				throw err
			}
			return Promise.resolve()
		})
		const result = await getStorageBasePath(defaultPath)
		expect(result).toBe(defaultPath)
		expect(showErrorSpy).toHaveBeenCalledTimes(1)
		const firstArg = showErrorSpy.mock.calls[0][0]
		expect(typeof firstArg).toBe("string")
	})
	it("returns the default path when customStoragePath is an empty string and does not touch fs", async () => {
		vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
			get: vi.fn().mockReturnValue(""),
		})
		const fsPromises = await import("fs/promises")
		const { getStorageBasePath } = await import("../storage")
		const result = await getStorageBasePath(defaultPath)
		expect(result).toBe(defaultPath)
		expect(fsPromises.mkdir).not.toHaveBeenCalled()
		expect(fsPromises.access).not.toHaveBeenCalled()
	})
	it("falls back to default when mkdir fails and does not attempt access", async () => {
		const customPath = "/test/storage/failmkdir"
		vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
			get: vi.fn().mockReturnValue(customPath),
		})
		const showErrorSpy = vi.spyOn(vscode.window, "showErrorMessage").mockResolvedValue(undefined)
		const fsPromises = await import("fs/promises")
		const { getStorageBasePath } = await import("../storage")
		const mkdirMock = fsPromises.mkdir
		mkdirMock.mockImplementationOnce(async (p) => {
			if (p === customPath) {
				const err = new Error("EACCES: permission denied")
				err.code = "EACCES"
				throw err
			}
			return Promise.resolve()
		})
		const result = await getStorageBasePath(defaultPath)
		expect(result).toBe(defaultPath)
		expect(fsPromises.access).not.toHaveBeenCalled()
		expect(showErrorSpy).toHaveBeenCalledTimes(1)
	})
	it("passes the correct permission flags (R_OK | W_OK | X_OK) to fs.access", async () => {
		const customPath = "/test/storage/path"
		vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
			get: vi.fn().mockReturnValue(customPath),
		})
		const fsPromises = await import("fs/promises")
		const { getStorageBasePath } = await import("../storage")
		await getStorageBasePath(defaultPath)
		const constants = fsPromises.constants
		const expectedFlags = constants.R_OK | constants.W_OK | constants.X_OK
		expect(fsPromises.access).toHaveBeenCalledWith(customPath, expectedFlags)
	})
	it("falls back when directory is readable but not writable (partial permissions)", async () => {
		const customPath = "/test/storage/readonly"
		vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue({
			get: vi.fn().mockReturnValue(customPath),
		})
		const showErrorSpy = vi.spyOn(vscode.window, "showErrorMessage").mockResolvedValue(undefined)
		const fsPromises = await import("fs/promises")
		const { getStorageBasePath } = await import("../storage")
		const accessMock = fsPromises.access
		const constants = fsPromises.constants
		accessMock.mockImplementationOnce(async (p, mode) => {
			// Simulate readable (R_OK) but not writable/executable (W_OK | X_OK)
			if (p === customPath && mode && mode & (constants.W_OK | constants.X_OK)) {
				const err = new Error("EACCES: permission denied")
				err.code = "EACCES"
				throw err
			}
			return Promise.resolve()
		})
		const result = await getStorageBasePath(defaultPath)
		expect(result).toBe(defaultPath)
		expect(showErrorSpy).toHaveBeenCalledTimes(1)
	})
})
