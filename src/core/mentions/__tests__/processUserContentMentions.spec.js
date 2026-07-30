"use strict"
// npx vitest core/mentions/__tests__/processUserContentMentions.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const processUserContentMentions_1 = require("../processUserContentMentions")
const index_1 = require("../index")
// Mock the parseMentions function
vi.mock("../index", () => ({
	parseMentions: vi.fn(),
}))
describe("processUserContentMentions", () => {
	let mockFileContextTracker
	let mockAliIgnoreController
	beforeEach(() => {
		vi.clearAllMocks()
		mockFileContextTracker = {}
		mockAliIgnoreController = {}
		// Default mock implementation - returns ParseMentionsResult object
		vi.mocked(index_1.parseMentions).mockImplementation(async (text) => ({
			text: `parsed: ${text}`,
			mode: undefined,
			contentBlocks: [],
		}))
	})
	describe("content processing", () => {
		it("should process text blocks with <user_message> tags", async () => {
			const userContent = [
				{
					type: "text",
					text: "<user_message>Do something</user_message>",
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(index_1.parseMentions).toHaveBeenCalled()
			expect(result.content[0]).toEqual({
				type: "text",
				text: "parsed: <user_message>Do something</user_message>",
			})
			expect(result.mode).toBeUndefined()
		})
		it("should not process text blocks without user_message tags", async () => {
			const userContent = [
				{
					type: "text",
					text: "Regular text without special tags",
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(index_1.parseMentions).not.toHaveBeenCalled()
			expect(result.content[0]).toEqual(userContent[0])
			expect(result.mode).toBeUndefined()
		})
		it("should process tool_result blocks with string content", async () => {
			const userContent = [
				{
					type: "tool_result",
					tool_use_id: "123",
					content: "<user_message>Tool feedback</user_message>",
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(index_1.parseMentions).toHaveBeenCalled()
			// String content is now converted to array format to support content blocks
			expect(result.content[0]).toEqual({
				type: "tool_result",
				tool_use_id: "123",
				content: [
					{
						type: "text",
						text: "parsed: <user_message>Tool feedback</user_message>",
					},
				],
			})
			expect(result.mode).toBeUndefined()
		})
		it("should process tool_result blocks with array content", async () => {
			const userContent = [
				{
					type: "tool_result",
					tool_use_id: "123",
					content: [
						{
							type: "text",
							text: "<user_message>Array task</user_message>",
						},
						{
							type: "text",
							text: "Regular text",
						},
					],
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(index_1.parseMentions).toHaveBeenCalledTimes(1)
			expect(result.content[0]).toEqual({
				type: "tool_result",
				tool_use_id: "123",
				content: [
					{
						type: "text",
						text: "parsed: <user_message>Array task</user_message>",
					},
					{
						type: "text",
						text: "Regular text",
					},
				],
			})
			expect(result.mode).toBeUndefined()
		})
		it("should handle mixed content types (text + image)", async () => {
			const userContent = [
				{
					type: "text",
					text: "<user_message>First task</user_message>",
				},
				{
					type: "image",
					image: "base64data",
					mediaType: "image/png",
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent: userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(index_1.parseMentions).toHaveBeenCalledTimes(1)
			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toEqual({
				type: "text",
				text: "parsed: <user_message>First task</user_message>",
			})
			expect(result.content[1]).toEqual(userContent[1]) // Image block unchanged
			expect(result.mode).toBeUndefined()
		})
	})
	describe("showAliIgnoredFiles parameter", () => {
		it("should default showAliIgnoredFiles to false", async () => {
			const userContent = [
				{
					type: "text",
					text: "<user_message>Test default</user_message>",
				},
			]
			await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(index_1.parseMentions).toHaveBeenCalledWith(
				"<user_message>Test default</user_message>",
				"/test",
				mockFileContextTracker,
				undefined,
				false, // showAliIgnoredFiles should default to false
				true, // includeDiagnosticMessages
				50, // maxDiagnosticMessages
				undefined,
				"code",
			)
		})
		it("should respect showAliIgnoredFiles when explicitly set to false", async () => {
			const userContent = [
				{
					type: "text",
					text: "<user_message>Test explicit false</user_message>",
				},
			]
			await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
				showAliIgnoredFiles: false,
			})
			expect(index_1.parseMentions).toHaveBeenCalledWith(
				"<user_message>Test explicit false</user_message>",
				"/test",
				mockFileContextTracker,
				undefined,
				false,
				true, // includeDiagnosticMessages
				50, // maxDiagnosticMessages
				undefined,
				"code",
			)
		})
	})
	describe("slash command content processing", () => {
		it("should separate slash command content into a new block", async () => {
			vi.mocked(index_1.parseMentions).mockResolvedValueOnce({
				text: "parsed text",
				slashCommandHelp: "command help",
				mode: undefined,
				contentBlocks: [],
			})
			const userContent = [
				{
					type: "text",
					text: "<user_message>Run command</user_message>",
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(result.content).toHaveLength(2)
			expect(result.content[0]).toEqual({
				type: "text",
				text: "parsed text",
			})
			expect(result.content[1]).toEqual({
				type: "text",
				text: "command help",
			})
		})
		it("should include slash command content in tool_result string content", async () => {
			vi.mocked(index_1.parseMentions).mockResolvedValueOnce({
				text: "parsed tool output",
				slashCommandHelp: "command help",
				mode: undefined,
				contentBlocks: [],
			})
			const userContent = [
				{
					type: "tool_result",
					tool_use_id: "123",
					content: "<user_message>Tool output</user_message>",
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toEqual({
				type: "tool_result",
				tool_use_id: "123",
				content: [
					{
						type: "text",
						text: "parsed tool output",
					},
					{
						type: "text",
						text: "command help",
					},
				],
			})
		})
		it("should include slash command content in tool_result array content", async () => {
			vi.mocked(index_1.parseMentions).mockResolvedValueOnce({
				text: "parsed array item",
				slashCommandHelp: "command help",
				mode: undefined,
				contentBlocks: [],
			})
			const userContent = [
				{
					type: "tool_result",
					tool_use_id: "123",
					content: [
						{
							type: "text",
							text: "<user_message>Array item</user_message>",
						},
					],
				},
			]
			const result = await (0, processUserContentMentions_1.processUserContentMentions)({
				userContent,
				cwd: "/test",
				fileContextTracker: mockFileContextTracker,
			})
			expect(result.content).toHaveLength(1)
			expect(result.content[0]).toEqual({
				type: "tool_result",
				tool_use_id: "123",
				content: [
					{
						type: "text",
						text: "parsed array item",
					},
					{
						type: "text",
						text: "command help",
					},
				],
			})
		})
	})
})
