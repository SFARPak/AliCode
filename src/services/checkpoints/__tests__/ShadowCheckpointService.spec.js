"use strict"
// npx vitest run src/services/checkpoints/__tests__/ShadowCheckpointService.spec.ts
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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const promises_1 = __importDefault(require("fs/promises"))
const path_1 = __importDefault(require("path"))
const os_1 = __importDefault(require("os"))
const events_1 = require("events")
const simple_git_1 = require("simple-git")
const fs_1 = require("../../../utils/fs")
const fileSearch = __importStar(require("../../../services/search/file-search"))
const RepoPerTaskCheckpointService_1 = require("../RepoPerTaskCheckpointService")
const tmpDir = path_1.default.join(os_1.default.tmpdir(), "CheckpointService")
const initWorkspaceRepo = async ({
	workspaceDir,
	userName = "AliCode",
	userEmail = "support@roocode.com",
	testFileName = "test.txt",
	textFileContent = "Hello, world!",
}) => {
	// Create a temporary directory for testing.
	await promises_1.default.mkdir(workspaceDir, { recursive: true })
	// Initialize git repo.
	const git = (0, simple_git_1.simpleGit)(workspaceDir)
	await git.init()
	await git.addConfig("user.name", userName)
	await git.addConfig("user.email", userEmail)
	// Create test file.
	const testFile = path_1.default.join(workspaceDir, testFileName)
	await promises_1.default.writeFile(testFile, textFileContent)
	// Create initial commit.
	await git.add(".")
	await git.commit("Initial commit")
	return { git, testFile }
}
describe.each([[RepoPerTaskCheckpointService_1.RepoPerTaskCheckpointService, "RepoPerTaskCheckpointService"]])(
	"CheckpointService",
	(klass, prefix) => {
		const taskId = "test-task"
		let workspaceGit
		let testFile
		let service
		beforeEach(async () => {
			const shadowDir = path_1.default.join(tmpDir, `${prefix}-${Date.now()}`)
			const workspaceDir = path_1.default.join(tmpDir, `workspace-${Date.now()}`)
			const repo = await initWorkspaceRepo({ workspaceDir })
			workspaceGit = repo.git
			testFile = repo.testFile
			service = await klass.create({ taskId, shadowDir, workspaceDir, log: () => {} })
			await service.initShadowGit()
		})
		afterEach(async () => {
			vitest.restoreAllMocks()
		})
		afterAll(async () => {
			await promises_1.default.rm(tmpDir, { recursive: true, force: true })
		}, 60_000) // 60 second timeout for Windows cleanup
		describe(`${klass.name}#getDiff`, () => {
			it("returns the correct diff between commits", async () => {
				await promises_1.default.writeFile(testFile, "Ahoy, world!")
				const commit1 = await service.saveCheckpoint("Ahoy, world!")
				expect(commit1?.commit).toBeTruthy()
				await promises_1.default.writeFile(testFile, "Goodbye, world!")
				const commit2 = await service.saveCheckpoint("Goodbye, world!")
				expect(commit2?.commit).toBeTruthy()
				const diff1 = await service.getDiff({ to: commit1.commit })
				expect(diff1).toHaveLength(1)
				expect(diff1[0].paths.relative).toBe("test.txt")
				expect(diff1[0].paths.absolute).toBe(testFile)
				expect(diff1[0].content.before).toBe("Hello, world!")
				expect(diff1[0].content.after).toBe("Ahoy, world!")
				const diff2 = await service.getDiff({ from: service.baseHash, to: commit2.commit })
				expect(diff2).toHaveLength(1)
				expect(diff2[0].paths.relative).toBe("test.txt")
				expect(diff2[0].paths.absolute).toBe(testFile)
				expect(diff2[0].content.before).toBe("Hello, world!")
				expect(diff2[0].content.after).toBe("Goodbye, world!")
				const diff12 = await service.getDiff({ from: commit1.commit, to: commit2.commit })
				expect(diff12).toHaveLength(1)
				expect(diff12[0].paths.relative).toBe("test.txt")
				expect(diff12[0].paths.absolute).toBe(testFile)
				expect(diff12[0].content.before).toBe("Ahoy, world!")
				expect(diff12[0].content.after).toBe("Goodbye, world!")
			})
			it("handles new files in diff", async () => {
				const newFile = path_1.default.join(service.workspaceDir, "new.txt")
				await promises_1.default.writeFile(newFile, "New file content")
				const commit = await service.saveCheckpoint("Add new file")
				expect(commit?.commit).toBeTruthy()
				const changes = await service.getDiff({ to: commit.commit })
				const change = changes.find((c) => c.paths.relative === "new.txt")
				expect(change).toBeDefined()
				expect(change?.content.before).toBe("")
				expect(change?.content.after).toBe("New file content")
			})
			it("handles deleted files in diff", async () => {
				const fileToDelete = path_1.default.join(service.workspaceDir, "new.txt")
				await promises_1.default.writeFile(fileToDelete, "New file content")
				const commit1 = await service.saveCheckpoint("Add file")
				expect(commit1?.commit).toBeTruthy()
				await promises_1.default.unlink(fileToDelete)
				const commit2 = await service.saveCheckpoint("Delete file")
				expect(commit2?.commit).toBeTruthy()
				const changes = await service.getDiff({ from: commit1.commit, to: commit2.commit })
				const change = changes.find((c) => c.paths.relative === "new.txt")
				expect(change).toBeDefined()
				expect(change.content.before).toBe("New file content")
				expect(change.content.after).toBe("")
			})
		})
		describe(`${klass.name}#saveCheckpoint`, () => {
			it("creates a checkpoint if there are pending changes", async () => {
				await promises_1.default.writeFile(testFile, "Ahoy, world!")
				const commit1 = await service.saveCheckpoint("First checkpoint")
				expect(commit1?.commit).toBeTruthy()
				const details1 = await service.getDiff({ to: commit1.commit })
				expect(details1[0].content.before).toContain("Hello, world!")
				expect(details1[0].content.after).toContain("Ahoy, world!")
				await promises_1.default.writeFile(testFile, "Hola, world!")
				const commit2 = await service.saveCheckpoint("Second checkpoint")
				expect(commit2?.commit).toBeTruthy()
				const details2 = await service.getDiff({ from: commit1.commit, to: commit2.commit })
				expect(details2[0].content.before).toContain("Ahoy, world!")
				expect(details2[0].content.after).toContain("Hola, world!")
				// Switch to checkpoint 1.
				await service.restoreCheckpoint(commit1.commit)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Ahoy, world!")
				// Switch to checkpoint 2.
				await service.restoreCheckpoint(commit2.commit)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Hola, world!")
				// Switch back to initial commit.
				expect(service.baseHash).toBeTruthy()
				await service.restoreCheckpoint(service.baseHash)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Hello, world!")
			})
			it("preserves workspace and index state after saving checkpoint", async () => {
				// Create three files with different states: staged, unstaged, and mixed.
				const unstagedFile = path_1.default.join(service.workspaceDir, "unstaged.txt")
				const stagedFile = path_1.default.join(service.workspaceDir, "staged.txt")
				const mixedFile = path_1.default.join(service.workspaceDir, "mixed.txt")
				await promises_1.default.writeFile(unstagedFile, "Initial unstaged")
				await promises_1.default.writeFile(stagedFile, "Initial staged")
				await promises_1.default.writeFile(mixedFile, "Initial mixed")
				await workspaceGit.add(["."])
				const result = await workspaceGit.commit("Add initial files")
				expect(result?.commit).toBeTruthy()
				await promises_1.default.writeFile(unstagedFile, "Modified unstaged")
				await promises_1.default.writeFile(stagedFile, "Modified staged")
				await workspaceGit.add([stagedFile])
				await promises_1.default.writeFile(mixedFile, "Modified mixed - staged")
				await workspaceGit.add([mixedFile])
				await promises_1.default.writeFile(mixedFile, "Modified mixed - unstaged")
				// Save checkpoint.
				const commit = await service.saveCheckpoint("Test checkpoint")
				expect(commit?.commit).toBeTruthy()
				// Verify workspace state is preserved.
				const status = await workspaceGit.status()
				// All files should be modified.
				expect(status.modified).toContain("unstaged.txt")
				expect(status.modified).toContain("staged.txt")
				expect(status.modified).toContain("mixed.txt")
				// Only staged and mixed files should be staged.
				expect(status.staged).not.toContain("unstaged.txt")
				expect(status.staged).toContain("staged.txt")
				expect(status.staged).toContain("mixed.txt")
				// Verify file contents.
				expect(await promises_1.default.readFile(unstagedFile, "utf-8")).toBe("Modified unstaged")
				expect(await promises_1.default.readFile(stagedFile, "utf-8")).toBe("Modified staged")
				expect(await promises_1.default.readFile(mixedFile, "utf-8")).toBe("Modified mixed - unstaged")
				// Verify staged changes (--cached shows only staged changes).
				const stagedDiff = await workspaceGit.diff(["--cached", "mixed.txt"])
				expect(stagedDiff).toContain("-Initial mixed")
				expect(stagedDiff).toContain("+Modified mixed - staged")
				// Verify unstaged changes (shows working directory changes).
				const unstagedDiff = await workspaceGit.diff(["mixed.txt"])
				expect(unstagedDiff).toContain("-Modified mixed - staged")
				expect(unstagedDiff).toContain("+Modified mixed - unstaged")
			})
			it("does not create a checkpoint if there are no pending changes", async () => {
				const commit0 = await service.saveCheckpoint("Zeroth checkpoint")
				expect(commit0?.commit).toBeFalsy()
				await promises_1.default.writeFile(testFile, "Ahoy, world!")
				const commit1 = await service.saveCheckpoint("First checkpoint")
				expect(commit1?.commit).toBeTruthy()
				const commit2 = await service.saveCheckpoint("Second checkpoint")
				expect(commit2?.commit).toBeFalsy()
			})
			it("includes untracked files in checkpoints", async () => {
				// Create an untracked file.
				const untrackedFile = path_1.default.join(service.workspaceDir, "untracked.txt")
				await promises_1.default.writeFile(untrackedFile, "I am untracked!")
				// Save a checkpoint with the untracked file.
				const commit1 = await service.saveCheckpoint("Checkpoint with untracked file")
				expect(commit1?.commit).toBeTruthy()
				// Verify the untracked file was included in the checkpoint.
				const details = await service.getDiff({ to: commit1.commit })
				expect(details[0].content.before).toContain("")
				expect(details[0].content.after).toContain("I am untracked!")
				// Create another checkpoint with a different state.
				await promises_1.default.writeFile(testFile, "Changed tracked file")
				const commit2 = await service.saveCheckpoint("Second checkpoint")
				expect(commit2?.commit).toBeTruthy()
				// Restore first checkpoint and verify untracked file is preserved.
				await service.restoreCheckpoint(commit1.commit)
				expect(await promises_1.default.readFile(untrackedFile, "utf-8")).toBe("I am untracked!")
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Hello, world!")
				// Restore second checkpoint and verify untracked file remains (since
				// restore preserves untracked files)
				await service.restoreCheckpoint(commit2.commit)
				expect(await promises_1.default.readFile(untrackedFile, "utf-8")).toBe("I am untracked!")
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Changed tracked file")
			})
			it("handles file deletions correctly", async () => {
				await promises_1.default.writeFile(testFile, "I am tracked!")
				const untrackedFile = path_1.default.join(service.workspaceDir, "new.txt")
				await promises_1.default.writeFile(untrackedFile, "I am untracked!")
				const commit1 = await service.saveCheckpoint("First checkpoint")
				expect(commit1?.commit).toBeTruthy()
				await promises_1.default.unlink(testFile)
				await promises_1.default.unlink(untrackedFile)
				const commit2 = await service.saveCheckpoint("Second checkpoint")
				expect(commit2?.commit).toBeTruthy()
				// Verify files are gone.
				await expect(promises_1.default.readFile(testFile, "utf-8")).rejects.toThrow()
				await expect(promises_1.default.readFile(untrackedFile, "utf-8")).rejects.toThrow()
				// Restore first checkpoint.
				await service.restoreCheckpoint(commit1.commit)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("I am tracked!")
				expect(await promises_1.default.readFile(untrackedFile, "utf-8")).toBe("I am untracked!")
				// Restore second checkpoint.
				await service.restoreCheckpoint(commit2.commit)
				await expect(promises_1.default.readFile(testFile, "utf-8")).rejects.toThrow()
				await expect(promises_1.default.readFile(untrackedFile, "utf-8")).rejects.toThrow()
			})
			it("does not create a checkpoint for ignored files", async () => {
				// Create a file that matches an ignored pattern (e.g., .log file).
				const ignoredFile = path_1.default.join(service.workspaceDir, "ignored.log")
				await promises_1.default.writeFile(ignoredFile, "Initial ignored content")
				const commit = await service.saveCheckpoint("Ignored file checkpoint")
				expect(commit?.commit).toBeFalsy()
				await promises_1.default.writeFile(ignoredFile, "Modified ignored content")
				const commit2 = await service.saveCheckpoint("Ignored file modified checkpoint")
				expect(commit2?.commit).toBeFalsy()
				expect(await promises_1.default.readFile(ignoredFile, "utf-8")).toBe("Modified ignored content")
			})
			it("does not create a checkpoint for LFS files", async () => {
				// Create a .gitattributes file with LFS patterns.
				const gitattributesPath = path_1.default.join(service.workspaceDir, ".gitattributes")
				await promises_1.default.writeFile(gitattributesPath, "*.lfs filter=lfs diff=lfs merge=lfs -text")
				// Re-initialize the service to trigger a write to .git/info/exclude.
				service = new klass(service.taskId, service.checkpointsDir, service.workspaceDir, () => {})
				const excludesPath = path_1.default.join(service.checkpointsDir, ".git", "info", "exclude")
				expect((await promises_1.default.readFile(excludesPath, "utf-8")).split("\n")).not.toContain("*.lfs")
				await service.initShadowGit()
				expect((await promises_1.default.readFile(excludesPath, "utf-8")).split("\n")).toContain("*.lfs")
				const commit0 = await service.saveCheckpoint("Add gitattributes")
				expect(commit0?.commit).toBeTruthy()
				// Create a file that matches an LFS pattern.
				const lfsFile = path_1.default.join(service.workspaceDir, "foo.lfs")
				await promises_1.default.writeFile(lfsFile, "Binary file content simulation")
				const commit = await service.saveCheckpoint("LFS file checkpoint")
				expect(commit?.commit).toBeFalsy()
				await promises_1.default.writeFile(lfsFile, "Modified binary content")
				const commit2 = await service.saveCheckpoint("LFS file modified checkpoint")
				expect(commit2?.commit).toBeFalsy()
				expect(await promises_1.default.readFile(lfsFile, "utf-8")).toBe("Modified binary content")
			})
		})
		describe(`${klass.name}#create`, () => {
			it("initializes a git repository if one does not already exist", async () => {
				const shadowDir = path_1.default.join(tmpDir, `${prefix}2-${Date.now()}`)
				const workspaceDir = path_1.default.join(tmpDir, `workspace2-${Date.now()}`)
				await promises_1.default.mkdir(workspaceDir)
				const newTestFile = path_1.default.join(workspaceDir, "test.txt")
				await promises_1.default.writeFile(newTestFile, "Hello, world!")
				expect(await promises_1.default.readFile(newTestFile, "utf-8")).toBe("Hello, world!")
				// Ensure the git repository was initialized.
				const newService = await klass.create({ taskId, shadowDir, workspaceDir, log: () => {} })
				const { created } = await newService.initShadowGit()
				expect(created).toBeTruthy()
				const gitDir = path_1.default.join(newService.checkpointsDir, ".git")
				expect(await promises_1.default.stat(gitDir)).toBeTruthy()
				// Save a new checkpoint: Ahoy, world!
				await promises_1.default.writeFile(newTestFile, "Ahoy, world!")
				const commit1 = await newService.saveCheckpoint("Ahoy, world!")
				expect(commit1?.commit).toBeTruthy()
				expect(await promises_1.default.readFile(newTestFile, "utf-8")).toBe("Ahoy, world!")
				// Restore "Hello, world!"
				await newService.restoreCheckpoint(newService.baseHash)
				expect(await promises_1.default.readFile(newTestFile, "utf-8")).toBe("Hello, world!")
				// Restore "Ahoy, world!"
				await newService.restoreCheckpoint(commit1.commit)
				expect(await promises_1.default.readFile(newTestFile, "utf-8")).toBe("Ahoy, world!")
				await promises_1.default.rm(newService.checkpointsDir, { recursive: true, force: true })
				await promises_1.default.rm(newService.workspaceDir, { recursive: true, force: true })
			})
		})
		describe(`${klass.name}#hasNestedGitRepositories`, () => {
			it("throws error when nested git repositories are detected during initialization", async () => {
				// Create a new temporary workspace and service for this test.
				const shadowDir = path_1.default.join(tmpDir, `${prefix}-nested-git-${Date.now()}`)
				const workspaceDir = path_1.default.join(tmpDir, `workspace-nested-git-${Date.now()}`)
				// Create a primary workspace repo.
				await promises_1.default.mkdir(workspaceDir, { recursive: true })
				const mainGit = (0, simple_git_1.simpleGit)(workspaceDir)
				await mainGit.init()
				await mainGit.addConfig("user.name", "AliCode")
				await mainGit.addConfig("user.email", "support@roocode.com")
				// Create a nested repo inside the workspace.
				const nestedRepoPath = path_1.default.join(workspaceDir, "nested-project")
				await promises_1.default.mkdir(nestedRepoPath, { recursive: true })
				const nestedGit = (0, simple_git_1.simpleGit)(nestedRepoPath)
				await nestedGit.init()
				await nestedGit.addConfig("user.name", "AliCode")
				await nestedGit.addConfig("user.email", "support@roocode.com")
				// Add a file to the nested repo.
				const nestedFile = path_1.default.join(nestedRepoPath, "nested-file.txt")
				await promises_1.default.writeFile(nestedFile, "Content in nested repo")
				await nestedGit.add(".")
				await nestedGit.commit("Initial commit in nested repo")
				// Create a test file in the main workspace.
				const mainFile = path_1.default.join(workspaceDir, "main-file.txt")
				await promises_1.default.writeFile(mainFile, "Content in main repo")
				await mainGit.add(".")
				await mainGit.commit("Initial commit in main repo")
				// Confirm nested git directory exists before initialization.
				const nestedGitDir = path_1.default.join(nestedRepoPath, ".git")
				const headFile = path_1.default.join(nestedGitDir, "HEAD")
				await promises_1.default.writeFile(headFile, "HEAD")
				expect(await (0, fs_1.fileExistsAtPath)(nestedGitDir)).toBe(true)
				vitest.spyOn(fileSearch, "executeRipgrep").mockImplementation(({ args }) => {
					const searchPattern = args[4]
					if (searchPattern.includes(".git/HEAD")) {
						// Return the HEAD file path, not the .git directory
						const headFilePath = path_1.default.join(
							path_1.default.relative(workspaceDir, nestedGitDir),
							"HEAD",
						)
						return Promise.resolve([
							{
								path: headFilePath,
								type: "file", // HEAD is a file, not a folder
								label: "HEAD",
							},
						])
					} else {
						return Promise.resolve([])
					}
				})
				const service = new klass(taskId, shadowDir, workspaceDir, () => {})
				// Verify that initialization throws an error when nested git repos are detected
				// The error message now includes the specific path of the nested repository
				await expect(service.initShadowGit()).rejects.toThrowError(
					/Checkpoints are disabled because a nested git repository was detected at:/,
				)
				// Clean up.
				vitest.restoreAllMocks()
				await promises_1.default.rm(shadowDir, { recursive: true, force: true })
				await promises_1.default.rm(workspaceDir, { recursive: true, force: true })
			})
			it("succeeds when no nested git repositories are detected", async () => {
				// Create a new temporary workspace and service for this test.
				const shadowDir = path_1.default.join(tmpDir, `${prefix}-no-nested-git-${Date.now()}`)
				const workspaceDir = path_1.default.join(tmpDir, `workspace-no-nested-git-${Date.now()}`)
				// Create a primary workspace repo without any nested repos.
				await promises_1.default.mkdir(workspaceDir, { recursive: true })
				const mainGit = (0, simple_git_1.simpleGit)(workspaceDir)
				await mainGit.init()
				await mainGit.addConfig("user.name", "AliCode")
				await mainGit.addConfig("user.email", "support@roocode.com")
				// Create a test file in the main workspace.
				const mainFile = path_1.default.join(workspaceDir, "main-file.txt")
				await promises_1.default.writeFile(mainFile, "Content in main repo")
				await mainGit.add(".")
				await mainGit.commit("Initial commit in main repo")
				vitest.spyOn(fileSearch, "executeRipgrep").mockImplementation(() => {
					// Return empty array to simulate no nested git repos found
					return Promise.resolve([])
				})
				const service = new klass(taskId, shadowDir, workspaceDir, () => {})
				// Verify that initialization succeeds when no nested git repos are detected
				await expect(service.initShadowGit()).resolves.not.toThrow()
				expect(service.isInitialized).toBe(true)
				// Clean up.
				vitest.restoreAllMocks()
				await promises_1.default.rm(shadowDir, { recursive: true, force: true })
				await promises_1.default.rm(workspaceDir, { recursive: true, force: true })
			})
		})
		describe(`${klass.name}#events`, () => {
			it("emits initialize event when service is created", async () => {
				const shadowDir = path_1.default.join(tmpDir, `${prefix}3-${Date.now()}`)
				const workspaceDir = path_1.default.join(tmpDir, `workspace3-${Date.now()}`)
				await promises_1.default.mkdir(workspaceDir, { recursive: true })
				const newTestFile = path_1.default.join(workspaceDir, "test.txt")
				await promises_1.default.writeFile(newTestFile, "Testing events!")
				// Create a mock implementation of emit to track events.
				const emitSpy = vitest.spyOn(events_1.EventEmitter.prototype, "emit")
				// Create the service - this will trigger the initialize event.
				const newService = await klass.create({ taskId, shadowDir, workspaceDir, log: () => {} })
				await newService.initShadowGit()
				// Find the initialize event in the emit calls.
				let initializeEvent = null
				for (let i = 0; i < emitSpy.mock.calls.length; i++) {
					const call = emitSpy.mock.calls[i]
					if (call[0] === "initialize") {
						initializeEvent = call[1]
						break
					}
				}
				// Restore the spy.
				emitSpy.mockRestore()
				// Verify the event was emitted with the correct data.
				expect(initializeEvent).not.toBeNull()
				expect(initializeEvent.type).toBe("initialize")
				expect(initializeEvent.workspaceDir).toBe(workspaceDir)
				expect(initializeEvent.baseHash).toBeTruthy()
				expect(typeof initializeEvent.created).toBe("boolean")
				expect(typeof initializeEvent.duration).toBe("number")
				// Verify the event was emitted with the correct data.
				expect(initializeEvent).not.toBeNull()
				expect(initializeEvent.type).toBe("initialize")
				expect(initializeEvent.workspaceDir).toBe(workspaceDir)
				expect(initializeEvent.baseHash).toBeTruthy()
				expect(typeof initializeEvent.created).toBe("boolean")
				expect(typeof initializeEvent.duration).toBe("number")
				// Clean up.
				await promises_1.default.rm(shadowDir, { recursive: true, force: true })
				await promises_1.default.rm(workspaceDir, { recursive: true, force: true })
			})
			it("emits checkpoint event when saving checkpoint", async () => {
				const checkpointHandler = vitest.fn()
				service.on("checkpoint", checkpointHandler)
				await promises_1.default.writeFile(testFile, "Changed content for checkpoint event test")
				const result = await service.saveCheckpoint("Test checkpoint event")
				expect(result?.commit).toBeDefined()
				expect(checkpointHandler).toHaveBeenCalledTimes(1)
				const eventData = checkpointHandler.mock.calls[0][0]
				expect(eventData.type).toBe("checkpoint")
				expect(eventData.toHash).toBeDefined()
				expect(eventData.toHash).toBe(result.commit)
				expect(typeof eventData.duration).toBe("number")
			})
			it("emits restore event when restoring checkpoint", async () => {
				// First create a checkpoint to restore.
				await promises_1.default.writeFile(testFile, "Content for restore test")
				const commit = await service.saveCheckpoint("Checkpoint for restore test")
				expect(commit?.commit).toBeTruthy()
				// Change the file again.
				await promises_1.default.writeFile(testFile, "Changed after checkpoint")
				// Setup restore event listener.
				const restoreHandler = vitest.fn()
				service.on("restore", restoreHandler)
				// Restore the checkpoint.
				await service.restoreCheckpoint(commit.commit)
				// Verify the event was emitted.
				expect(restoreHandler).toHaveBeenCalledTimes(1)
				const eventData = restoreHandler.mock.calls[0][0]
				expect(eventData.type).toBe("restore")
				expect(eventData.commitHash).toBe(commit.commit)
				expect(typeof eventData.duration).toBe("number")
				// Verify the file was actually restored.
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Content for restore test")
			})
			it("emits error event when an error occurs", async () => {
				const errorHandler = vitest.fn()
				service.on("error", errorHandler)
				// Force an error by providing an invalid commit hash.
				const invalidCommitHash = "invalid-commit-hash"
				// Try to restore an invalid checkpoint.
				try {
					await service.restoreCheckpoint(invalidCommitHash)
				} catch (error) {
					// Expected to throw, we're testing the event emission.
				}
				// Verify the error event was emitted.
				expect(errorHandler).toHaveBeenCalledTimes(1)
				const eventData = errorHandler.mock.calls[0][0]
				expect(eventData.type).toBe("error")
				expect(eventData.error).toBeInstanceOf(Error)
			})
			it("supports multiple event listeners for the same event", async () => {
				const checkpointHandler1 = vitest.fn()
				const checkpointHandler2 = vitest.fn()
				service.on("checkpoint", checkpointHandler1)
				service.on("checkpoint", checkpointHandler2)
				await promises_1.default.writeFile(testFile, "Content for multiple listeners test")
				const result = await service.saveCheckpoint("Testing multiple listeners")
				// Verify both handlers were called with the same event data.
				expect(checkpointHandler1).toHaveBeenCalledTimes(1)
				expect(checkpointHandler2).toHaveBeenCalledTimes(1)
				const eventData1 = checkpointHandler1.mock.calls[0][0]
				const eventData2 = checkpointHandler2.mock.calls[0][0]
				expect(eventData1).toEqual(eventData2)
				expect(eventData1.type).toBe("checkpoint")
				expect(eventData1.toHash).toBe(result?.commit)
			})
			it("allows removing event listeners", async () => {
				const checkpointHandler = vitest.fn()
				// Add the listener.
				service.on("checkpoint", checkpointHandler)
				// Make a change and save a checkpoint.
				await promises_1.default.writeFile(testFile, "Content for remove listener test - part 1")
				await service.saveCheckpoint("Testing listener - part 1")
				// Verify handler was called.
				expect(checkpointHandler).toHaveBeenCalledTimes(1)
				checkpointHandler.mockClear()
				// Remove the listener.
				service.off("checkpoint", checkpointHandler)
				// Make another change and save a checkpoint.
				await promises_1.default.writeFile(testFile, "Content for remove listener test - part 2")
				await service.saveCheckpoint("Testing listener - part 2")
				// Verify handler was not called after being removed.
				expect(checkpointHandler).not.toHaveBeenCalled()
			})
		})
		describe(`${klass.name}#saveCheckpoint with allowEmpty option`, () => {
			it("creates checkpoint with allowEmpty=true even when no changes", async () => {
				// No changes made, but force checkpoint creation
				const result = await service.saveCheckpoint("Empty checkpoint", { allowEmpty: true })
				expect(result).toBeDefined()
				expect(result?.commit).toBeTruthy()
				expect(typeof result?.commit).toBe("string")
			})
			it("does not create checkpoint with allowEmpty=false when no changes", async () => {
				const result = await service.saveCheckpoint("No changes checkpoint", { allowEmpty: false })
				expect(result).toBeUndefined()
			})
			it("does not create checkpoint by default when no changes", async () => {
				const result = await service.saveCheckpoint("Default behavior checkpoint")
				expect(result).toBeUndefined()
			})
			it("creates checkpoint with changes regardless of allowEmpty setting", async () => {
				await promises_1.default.writeFile(testFile, "Modified content for allowEmpty test")
				const resultWithAllowEmpty = await service.saveCheckpoint("With changes and allowEmpty", {
					allowEmpty: true,
				})
				expect(resultWithAllowEmpty?.commit).toBeTruthy()
				await promises_1.default.writeFile(testFile, "Another modification for allowEmpty test")
				const resultWithoutAllowEmpty = await service.saveCheckpoint("With changes, no allowEmpty")
				expect(resultWithoutAllowEmpty?.commit).toBeTruthy()
			})
			it("emits checkpoint event for empty commits when allowEmpty=true", async () => {
				const checkpointHandler = vitest.fn()
				service.on("checkpoint", checkpointHandler)
				const result = await service.saveCheckpoint("Empty checkpoint event test", { allowEmpty: true })
				expect(checkpointHandler).toHaveBeenCalledTimes(1)
				const eventData = checkpointHandler.mock.calls[0][0]
				expect(eventData.type).toBe("checkpoint")
				expect(eventData.toHash).toBe(result?.commit)
				expect(typeof eventData.duration).toBe("number")
			})
			it("does not emit checkpoint event when no changes and allowEmpty=false", async () => {
				// First, create a checkpoint to ensure we're not in the initial state
				await promises_1.default.writeFile(testFile, "Setup content")
				await service.saveCheckpoint("Setup checkpoint")
				// Reset the file to original state
				await promises_1.default.writeFile(testFile, "Hello, world!")
				await service.saveCheckpoint("Reset to original")
				// Now test with no changes and allowEmpty=false
				const checkpointHandler = vitest.fn()
				service.on("checkpoint", checkpointHandler)
				const result = await service.saveCheckpoint("No changes, no event", { allowEmpty: false })
				expect(result).toBeUndefined()
				expect(checkpointHandler).not.toHaveBeenCalled()
			})
			it("handles multiple empty checkpoints correctly", async () => {
				const commit1 = await service.saveCheckpoint("First empty checkpoint", { allowEmpty: true })
				expect(commit1?.commit).toBeTruthy()
				const commit2 = await service.saveCheckpoint("Second empty checkpoint", { allowEmpty: true })
				expect(commit2?.commit).toBeTruthy()
				// Commits should be different
				expect(commit1?.commit).not.toBe(commit2?.commit)
			})
			it("logs correct message for allowEmpty option", async () => {
				const logMessages = []
				const testService = await klass.create({
					taskId: "log-test",
					shadowDir: path_1.default.join(tmpDir, `log-test-${Date.now()}`),
					workspaceDir: service.workspaceDir,
					log: (message) => logMessages.push(message),
				})
				await testService.initShadowGit()
				await testService.saveCheckpoint("Test logging with allowEmpty", { allowEmpty: true })
				const saveCheckpointLogs = logMessages.filter(
					(msg) => msg.includes("starting checkpoint save") && msg.includes("allowEmpty: true"),
				)
				expect(saveCheckpointLogs).toHaveLength(1)
				await testService.saveCheckpoint("Test logging without allowEmpty")
				const defaultLogs = logMessages.filter(
					(msg) => msg.includes("starting checkpoint save") && msg.includes("allowEmpty: false"),
				)
				expect(defaultLogs).toHaveLength(1)
			})
			it("maintains checkpoint history with empty commits", async () => {
				// Create a regular checkpoint
				await promises_1.default.writeFile(testFile, "Regular change")
				const regularCommit = await service.saveCheckpoint("Regular checkpoint")
				expect(regularCommit?.commit).toBeTruthy()
				// Create an empty checkpoint
				const emptyCommit = await service.saveCheckpoint("Empty checkpoint", { allowEmpty: true })
				expect(emptyCommit?.commit).toBeTruthy()
				// Create another regular checkpoint
				await promises_1.default.writeFile(testFile, "Another regular change")
				const anotherCommit = await service.saveCheckpoint("Another regular checkpoint")
				expect(anotherCommit?.commit).toBeTruthy()
				// Verify we can restore to the empty checkpoint
				await service.restoreCheckpoint(emptyCommit.commit)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Regular change")
				// Verify we can restore to other checkpoints
				await service.restoreCheckpoint(regularCommit.commit)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Regular change")
				await service.restoreCheckpoint(anotherCommit.commit)
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Another regular change")
			})
			it("handles getDiff correctly with empty commits", async () => {
				// Create a regular checkpoint
				await promises_1.default.writeFile(testFile, "Content before empty")
				const beforeEmpty = await service.saveCheckpoint("Before empty")
				expect(beforeEmpty?.commit).toBeTruthy()
				// Create an empty checkpoint
				const emptyCommit = await service.saveCheckpoint("Empty checkpoint", { allowEmpty: true })
				expect(emptyCommit?.commit).toBeTruthy()
				// Get diff between regular commit and empty commit
				const diff = await service.getDiff({
					from: beforeEmpty.commit,
					to: emptyCommit.commit,
				})
				// Should have no differences since empty commit doesn't change anything
				expect(diff).toHaveLength(0)
			})
			it("works correctly in integration with new task workflow", async () => {
				// Simulate the new task workflow where we force a checkpoint even with no changes
				// This tests the specific use case mentioned in the git commit
				// Start with a clean state (no pending changes)
				const initialState = await service.saveCheckpoint("Check initial state")
				expect(initialState).toBeUndefined() // No changes, so no commit
				// Force a checkpoint for new task (this is the new functionality)
				const newTaskCheckpoint = await service.saveCheckpoint("New task checkpoint", { allowEmpty: true })
				expect(newTaskCheckpoint?.commit).toBeTruthy()
				// Verify the checkpoint was created and can be restored
				await promises_1.default.writeFile(testFile, "Work done in new task")
				const workCommit = await service.saveCheckpoint("Work in new task")
				expect(workCommit?.commit).toBeTruthy()
				// Restore to the new task checkpoint
				await service.restoreCheckpoint(newTaskCheckpoint.commit)
				// File should be back to original state
				expect(await promises_1.default.readFile(testFile, "utf-8")).toBe("Hello, world!")
			})
			it("does not apply git templates when initializing shadow repo", async () => {
				// This test verifies that git init uses --template="" and GIT_TEMPLATE_DIR
				// is stripped, preventing system/user git hooks from leaking into the shadow repo.
				const templateDir = path_1.default.join(tmpDir, `git-template-${Date.now()}`)
				const hooksDir = path_1.default.join(templateDir, "hooks")
				await promises_1.default.mkdir(hooksDir, { recursive: true })
				await promises_1.default.writeFile(path_1.default.join(hooksDir, "pre-commit"), "#!/bin/sh\nexit 1", {
					mode: 0o755,
				})
				const testShadowDir = path_1.default.join(tmpDir, `shadow-template-test-${Date.now()}`)
				const testWorkspaceDir = path_1.default.join(tmpDir, `workspace-template-test-${Date.now()}`)
				await initWorkspaceRepo({ workspaceDir: testWorkspaceDir })
				const originalTemplateDir = process.env.GIT_TEMPLATE_DIR
				process.env.GIT_TEMPLATE_DIR = templateDir
				try {
					const testService = await klass.create({
						taskId: `test-template-${Date.now()}`,
						shadowDir: testShadowDir,
						workspaceDir: testWorkspaceDir,
						log: () => {},
					})
					await testService.initShadowGit()
					// Verify no hooks were copied from the template
					const shadowHooksDir = path_1.default.join(testShadowDir, ".git", "hooks")
					let hookFiles = []
					try {
						hookFiles = await promises_1.default.readdir(shadowHooksDir)
					} catch {
						// hooks dir may not exist at all, which is fine
					}
					// The pre-commit hook from the template should NOT be present
					expect(hookFiles).not.toContain("pre-commit")
				} finally {
					if (originalTemplateDir !== undefined) {
						process.env.GIT_TEMPLATE_DIR = originalTemplateDir
					} else {
						delete process.env.GIT_TEMPLATE_DIR
					}
					await promises_1.default.rm(testShadowDir, { recursive: true, force: true })
					await promises_1.default.rm(testWorkspaceDir, { recursive: true, force: true })
					await promises_1.default.rm(templateDir, { recursive: true, force: true })
				}
			})
			it("isolates checkpoint operations from GIT_DIR environment variable", async () => {
				// This test verifies the fix for the issue where GIT_DIR environment variable
				// causes checkpoint commits to go to the wrong repository.
				// In the real-world Dev Container scenario, GIT_DIR is set BEFORE Ali starts,
				// so we need to set it BEFORE creating the checkpoint service.
				// Create a separate git directory to simulate GIT_DIR pointing elsewhere
				const externalGitDir = path_1.default.join(tmpDir, `external-git-${Date.now()}`)
				await promises_1.default.mkdir(externalGitDir, { recursive: true })
				const externalGit = (0, simple_git_1.simpleGit)(externalGitDir)
				await externalGit.init()
				await externalGit.addConfig("user.name", "External User")
				await externalGit.addConfig("user.email", "external@example.com")
				// Create and commit a file in the external repo
				const externalFile = path_1.default.join(externalGitDir, "external.txt")
				await promises_1.default.writeFile(externalFile, "External content")
				await externalGit.add(".")
				await externalGit.commit("External commit")
				// Store the original commit count in the external repo
				const externalLogBefore = await externalGit.log()
				const externalCommitCountBefore = externalLogBefore.total
				// Initialize the workspace repo BEFORE setting GIT_DIR
				// (In Dev Containers, the workspace repo already exists before GIT_DIR is set)
				const testShadowDir = path_1.default.join(tmpDir, `shadow-git-dir-test-${Date.now()}`)
				const testWorkspaceDir = path_1.default.join(tmpDir, `workspace-git-dir-test-${Date.now()}`)
				const testRepo = await initWorkspaceRepo({ workspaceDir: testWorkspaceDir })
				// Set GIT_DIR to point to the external repository BEFORE creating the service
				// This simulates the Dev Container environment where GIT_DIR is already set
				const originalGitDir = process.env.GIT_DIR
				const externalDotGit = path_1.default.join(externalGitDir, ".git")
				process.env.GIT_DIR = externalDotGit
				try {
					// Create a new checkpoint service with GIT_DIR already set
					// This is the key difference - we're creating the service
					// while GIT_DIR is set, just like in a real Dev Container
					const testService = await klass.create({
						taskId: `test-git-dir-${Date.now()}`,
						shadowDir: testShadowDir,
						workspaceDir: testWorkspaceDir,
						log: () => {},
					})
					await testService.initShadowGit()
					// Make a change in the workspace and save a checkpoint
					const testWorkspaceFile = path_1.default.join(testWorkspaceDir, "test.txt")
					await promises_1.default.writeFile(testWorkspaceFile, "Modified with GIT_DIR set")
					const commit = await testService.saveCheckpoint("Checkpoint with GIT_DIR set")
					expect(commit?.commit).toBeTruthy()
					// Verify the checkpoint was saved in the shadow repo, not the external repo
					// Temporarily clear GIT_DIR to check the external repo
					delete process.env.GIT_DIR
					const externalGitCheck = (0, simple_git_1.simpleGit)(externalGitDir)
					const externalLogAfter = await externalGitCheck.log()
					const externalCommitCountAfter = externalLogAfter.total
					// Restore GIT_DIR
					process.env.GIT_DIR = externalDotGit
					// External repo should have the same number of commits (no new commits)
					expect(externalCommitCountAfter).toBe(externalCommitCountBefore)
					// Verify the checkpoint is accessible in the shadow repo
					const diff = await testService.getDiff({ to: commit.commit })
					expect(diff).toHaveLength(1)
					expect(diff[0].paths.relative).toBe("test.txt")
					expect(diff[0].content.after).toBe("Modified with GIT_DIR set")
					// Verify we can restore the checkpoint
					await promises_1.default.writeFile(testWorkspaceFile, "Another modification")
					await testService.restoreCheckpoint(commit.commit)
					expect(await promises_1.default.readFile(testWorkspaceFile, "utf-8")).toBe(
						"Modified with GIT_DIR set",
					)
				} finally {
					// Restore original GIT_DIR
					if (originalGitDir !== undefined) {
						process.env.GIT_DIR = originalGitDir
					} else {
						delete process.env.GIT_DIR
					}
					// Clean up external git directory
					await promises_1.default.rm(externalGitDir, { recursive: true, force: true })
				}
			})
		})
	},
)
describe("worktree path comparison", () => {
	it("accepts core.worktree with trailing newline from git output", async () => {
		const shadowDir = path_1.default.join(tmpDir, `worktree-trim-${Date.now()}`)
		const workspaceDir = path_1.default.join(tmpDir, `workspace-trim-${Date.now()}`)
		try {
			await promises_1.default.mkdir(workspaceDir, { recursive: true })
			const mainGit = (0, simple_git_1.simpleGit)(workspaceDir)
			await mainGit.init()
			await mainGit.addConfig("user.name", "AliCode")
			await mainGit.addConfig("user.email", "support@roocode.com")
			await promises_1.default.writeFile(path_1.default.join(workspaceDir, "main.txt"), "main content")
			await mainGit.add("main.txt")
			await mainGit.commit("Initial commit")
			vitest.spyOn(fileSearch, "executeRipgrep").mockImplementation(() => {
				return Promise.resolve([])
			})
			// First init to create the shadow repo
			const service1 = new RepoPerTaskCheckpointService_1.RepoPerTaskCheckpointService(
				"trim-test",
				shadowDir,
				workspaceDir,
				() => {},
			)
			await service1.initShadowGit()
			// Second init with stubbed worktree returning a trailing newline
			const service2 = new RepoPerTaskCheckpointService_1.RepoPerTaskCheckpointService(
				"trim-test-2",
				shadowDir,
				workspaceDir,
				() => {},
			)
			vitest.spyOn(service2, "getShadowGitConfigWorktree").mockResolvedValue(workspaceDir + "\n")
			await service2.initShadowGit()
		} finally {
			vitest.restoreAllMocks()
			await promises_1.default.rm(shadowDir, { recursive: true, force: true })
			await promises_1.default.rm(workspaceDir, { recursive: true, force: true })
		}
	})
	it("throws when core.worktree is missing", async () => {
		const shadowDir = path_1.default.join(tmpDir, `worktree-missing-${Date.now()}`)
		const workspaceDir = path_1.default.join(tmpDir, `workspace-missing-${Date.now()}`)
		try {
			await promises_1.default.mkdir(workspaceDir, { recursive: true })
			const mainGit = (0, simple_git_1.simpleGit)(workspaceDir)
			await mainGit.init()
			await mainGit.addConfig("user.name", "AliCode")
			await mainGit.addConfig("user.email", "support@roocode.com")
			await promises_1.default.writeFile(path_1.default.join(workspaceDir, "main.txt"), "main content")
			await mainGit.add("main.txt")
			await mainGit.commit("Initial commit")
			vitest.spyOn(fileSearch, "executeRipgrep").mockImplementation(() => {
				return Promise.resolve([])
			})
			// First init to create the shadow repo
			const service1 = new RepoPerTaskCheckpointService_1.RepoPerTaskCheckpointService(
				"missing-test",
				shadowDir,
				workspaceDir,
				() => {},
			)
			await service1.initShadowGit()
			// Remove core.worktree from the shadow git config
			const shadowGit = (0, simple_git_1.simpleGit)(shadowDir)
			await shadowGit.raw(["config", "--unset", "core.worktree"])
			// Second init should throw because core.worktree is missing
			const service2 = new RepoPerTaskCheckpointService_1.RepoPerTaskCheckpointService(
				"missing-test-2",
				shadowDir,
				workspaceDir,
				() => {},
			)
			await expect(service2.initShadowGit()).rejects.toThrowError(/core\.worktree to be set/)
		} finally {
			vitest.restoreAllMocks()
			await promises_1.default.rm(shadowDir, { recursive: true, force: true })
			await promises_1.default.rm(workspaceDir, { recursive: true, force: true })
		}
	})
})
