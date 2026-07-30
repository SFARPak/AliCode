"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const Task_1 = require("../Task")
// Keep this test focused: if a queued message arrives while Task.ask() is blocked,
// it should be consumed and used to fulfill the ask.
describe("Task.ask queued message drain", () => {
	it("consumes queued message while blocked on followup ask", async () => {
		const task = Object.create(Task_1.Task.prototype)
		task.abort = false
		task.clineMessages = []
		task.askResponse = undefined
		task.askResponseText = undefined
		task.askResponseImages = undefined
		task.lastMessageTs = undefined
		// Message queue service exists in constructor; for unit test we can attach a real one.
		const { MessageQueueService } = await import("../../message-queue/MessageQueueService")
		task.messageQueueService = new MessageQueueService()
		task.addToClineMessages = vi.fn(async () => {})
		task.saveClineMessages = vi.fn(async () => {})
		task.updateClineMessage = vi.fn(async () => {})
		task.cancelAutoApprovalTimeout = vi.fn(() => {})
		task.checkpointSave = vi.fn(async () => {})
		task.emit = vi.fn()
		task.providerRef = { deref: () => undefined }
		const askPromise = task.ask("followup", "Q?", false)
		task.messageQueueService.addMessage("picked answer")
		const result = await askPromise
		expect(result.response).toBe("messageResponse")
		expect(result.text).toBe("picked answer")
	})
	it("does not consume queued messages for command_output asks", async () => {
		const task = Object.create(Task_1.Task.prototype)
		task.abort = false
		task.clineMessages = []
		task.askResponse = undefined
		task.askResponseText = undefined
		task.askResponseImages = undefined
		task.lastMessageTs = undefined
		const { MessageQueueService } = await import("../../message-queue/MessageQueueService")
		task.messageQueueService = new MessageQueueService()
		task.addToClineMessages = vi.fn(async () => {})
		task.saveClineMessages = vi.fn(async () => {})
		task.updateClineMessage = vi.fn(async () => {})
		task.cancelAutoApprovalTimeout = vi.fn(() => {})
		task.checkpointSave = vi.fn(async () => {})
		task.emit = vi.fn()
		task.providerRef = { deref: () => undefined }
		const askPromise = task.ask("command_output", "command is still running...", false)
		task.messageQueueService.addMessage("1+1=?")
		setTimeout(() => {
			task.approveAsk()
		}, 0)
		const result = await askPromise
		expect(result.response).toBe("yesButtonClicked")
		expect(result.text).toBeUndefined()
		expect(task.messageQueueService.isEmpty()).toBe(false)
		expect(task.messageQueueService.messages[0]?.text).toBe("1+1=?")
	})
})
