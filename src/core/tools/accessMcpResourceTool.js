"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.accessMcpResourceTool = exports.AccessMcpResourceTool = void 0
const responses_1 = require("../prompts/responses")
const BaseTool_1 = require("./BaseTool")
class AccessMcpResourceTool extends BaseTool_1.BaseTool {
	name = "access_mcp_resource"
	async execute(params, task, callbacks) {
		const { askApproval, handleError, pushToolResult } = callbacks
		const { server_name, uri } = params
		try {
			if (!server_name) {
				task.consecutiveMistakeCount++
				task.recordToolError("access_mcp_resource")
				pushToolResult(await task.sayAndCreateMissingParamError("access_mcp_resource", "server_name"))
				return
			}
			if (!uri) {
				task.consecutiveMistakeCount++
				task.recordToolError("access_mcp_resource")
				pushToolResult(await task.sayAndCreateMissingParamError("access_mcp_resource", "uri"))
				return
			}
			task.consecutiveMistakeCount = 0
			const completeMessage = JSON.stringify({
				type: "access_mcp_resource",
				serverName: server_name,
				uri,
			})
			const didApprove = await askApproval("use_mcp_server", completeMessage)
			if (!didApprove) {
				pushToolResult(responses_1.formatResponse.toolDenied())
				return
			}
			// Now execute the tool
			await task.say("mcp_server_request_started")
			const resourceResult = await task.providerRef.deref()?.getMcpHub()?.readResource(server_name, uri)
			const resourceResultPretty =
				resourceResult?.contents
					.map((item) => {
						if (item.text) {
							return item.text
						}
						return ""
					})
					.filter(Boolean)
					.join("\n\n") || "(Empty response)"
			// Handle images (image must contain mimetype and blob)
			let images = []
			resourceResult?.contents.forEach((item) => {
				if (item.mimeType?.startsWith("image") && item.blob) {
					if (item.blob.startsWith("data:")) {
						images.push(item.blob)
					} else {
						images.push(`data:${item.mimeType};base64,` + item.blob)
					}
				}
			})
			await task.say("mcp_server_response", resourceResultPretty, images)
			pushToolResult(responses_1.formatResponse.toolResult(resourceResultPretty, images))
		} catch (error) {
			await handleError("accessing MCP resource", error instanceof Error ? error : new Error(String(error)))
		}
	}
	async handlePartial(task, block) {
		const server_name = block.params.server_name ?? ""
		const uri = block.params.uri ?? ""
		const partialMessage = JSON.stringify({
			type: "access_mcp_resource",
			serverName: server_name,
			uri: uri,
		})
		await task.ask("use_mcp_server", partialMessage, block.partial).catch(() => {})
	}
}
exports.AccessMcpResourceTool = AccessMcpResourceTool
exports.accessMcpResourceTool = new AccessMcpResourceTool()
