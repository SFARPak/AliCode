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
const path = __importStar(require("path"))
const fs = __importStar(require("fs"))
const os = __importStar(require("os"))
// Mock ripgrep to avoid filesystem dependencies
vi.mock("../../ripgrep", () => ({
	getBinPath: vi.fn().mockResolvedValue("/mock/path/to/rg"),
}))
// Mock vscode
vi.mock("vscode", () => ({
	env: {
		appRoot: "/mock/app/root",
	},
}))
vi.mock("child_process", () => ({
	spawn: vi.fn(),
}))
vi.mock("../../path", () => ({
	arePathsEqual: vi.fn().mockReturnValue(false),
}))
const list_files_1 = require("../list-files")
const childProcess = __importStar(require("child_process"))
describe("list-files gitignore support", () => {
	let tempDir
	let originalCwd
	beforeEach(async () => {
		vi.clearAllMocks()
		// Create a temporary directory for testing
		tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "roo-test-"))
		originalCwd = process.cwd()
		process.chdir(tempDir)
	})
	afterEach(async () => {
		process.chdir(originalCwd)
		// Clean up temp directory
		await fs.promises.rm(tempDir, { recursive: true, force: true })
	})
	it("should respect .gitignore patterns for directories in recursive mode", async () => {
		// Setup test directory structure
		await fs.promises.mkdir(path.join(tempDir, "src"))
		await fs.promises.mkdir(path.join(tempDir, "node_modules"))
		await fs.promises.mkdir(path.join(tempDir, "build"))
		await fs.promises.mkdir(path.join(tempDir, "ignored-dir"))
		// Create .gitignore file
		await fs.promises.writeFile(path.join(tempDir, ".gitignore"), "node_modules/\nbuild/\nignored-dir/\n")
		// Create some files
		await fs.promises.writeFile(path.join(tempDir, "src", "index.ts"), "")
		await fs.promises.writeFile(path.join(tempDir, "node_modules", "package.json"), "")
		await fs.promises.writeFile(path.join(tempDir, "build", "output.js"), "")
		await fs.promises.writeFile(path.join(tempDir, "ignored-dir", "file.txt"), "")
		// Mock ripgrep to return only non-ignored files
		const mockSpawn = vi.mocked(childProcess.spawn)
		const mockProcess = {
			stdout: {
				on: vi.fn((event, callback) => {
					if (event === "data") {
						// Ripgrep should respect .gitignore and only return src/index.ts
						setTimeout(() => callback(`${path.join(tempDir, "src", "index.ts")}\n`), 10)
					}
				}),
			},
			stderr: {
				on: vi.fn(),
			},
			on: vi.fn((event, callback) => {
				if (event === "close") {
					setTimeout(() => callback(0), 20)
				}
			}),
			kill: vi.fn(),
		}
		mockSpawn.mockReturnValue(mockProcess)
		// Call listFiles in recursive mode
		const [files, didHitLimit] = await (0, list_files_1.listFiles)(tempDir, true, 100)
		// Verify that gitignored directories are not included
		const directoriesInResult = files.filter((f) => f.endsWith("/"))
		expect(directoriesInResult).not.toContain(path.join(tempDir, "node_modules") + "/")
		expect(directoriesInResult).not.toContain(path.join(tempDir, "build") + "/")
		expect(directoriesInResult).not.toContain(path.join(tempDir, "ignored-dir") + "/")
		// But src/ should be included
		expect(directoriesInResult).toContain(path.join(tempDir, "src") + "/")
	})
	it("should handle nested .gitignore files", async () => {
		// Setup nested directory structure
		await fs.promises.mkdir(path.join(tempDir, "src"), { recursive: true })
		await fs.promises.mkdir(path.join(tempDir, "src", "components"))
		await fs.promises.mkdir(path.join(tempDir, "src", "temp"))
		// Create root .gitignore
		await fs.promises.writeFile(path.join(tempDir, ".gitignore"), "node_modules/\n")
		// Create nested .gitignore in src/
		await fs.promises.writeFile(path.join(tempDir, "src", ".gitignore"), "temp/\n")
		// Mock ripgrep
		const mockSpawn = vi.mocked(childProcess.spawn)
		const mockProcess = {
			stdout: {
				on: vi.fn((event, callback) => {
					if (event === "data") {
						setTimeout(() => callback(""), 10)
					}
				}),
			},
			stderr: {
				on: vi.fn(),
			},
			on: vi.fn((event, callback) => {
				if (event === "close") {
					setTimeout(() => callback(0), 20)
				}
			}),
			kill: vi.fn(),
		}
		mockSpawn.mockReturnValue(mockProcess)
		// Call listFiles in recursive mode
		const [files, didHitLimit] = await (0, list_files_1.listFiles)(tempDir, true, 100)
		// Verify that nested gitignored directories are not included
		const directoriesInResult = files.filter((f) => f.endsWith("/"))
		expect(directoriesInResult).not.toContain(path.join(tempDir, "src", "temp") + "/")
		expect(directoriesInResult).toContain(path.join(tempDir, "src") + "/")
		expect(directoriesInResult).toContain(path.join(tempDir, "src", "components") + "/")
	})
})
