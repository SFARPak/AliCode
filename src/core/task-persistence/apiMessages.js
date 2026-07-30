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
exports.readApiMessages = readApiMessages
exports.saveApiMessages = saveApiMessages
const safeWriteJson_1 = require("../../utils/safeWriteJson")
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const fs_1 = require("../../utils/fs")
const globalFileNames_1 = require("../../shared/globalFileNames")
const storage_1 = require("../../utils/storage")
async function readApiMessages({ taskId, globalStoragePath }) {
	const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, taskId)
	const filePath = path.join(taskDir, globalFileNames_1.GlobalFileNames.apiConversationHistory)
	if (await (0, fs_1.fileExistsAtPath)(filePath)) {
		const fileContent = await fs.readFile(filePath, "utf8")
		try {
			const parsedData = JSON.parse(fileContent)
			if (!Array.isArray(parsedData)) {
				console.warn(
					`[readApiMessages] Parsed data is not an array (got ${typeof parsedData}), returning empty. TaskId: ${taskId}, Path: ${filePath}`,
				)
				return []
			}
			if (parsedData.length === 0) {
				console.error(
					`[Ali-Debug] readApiMessages: Found API conversation history file, but it's empty (parsed as []). TaskId: ${taskId}, Path: ${filePath}`,
				)
			}
			return parsedData
		} catch (error) {
			console.warn(
				`[readApiMessages] Error parsing API conversation history file, returning empty. TaskId: ${taskId}, Path: ${filePath}, Error: ${error}`,
			)
			return []
		}
	} else {
		const oldPath = path.join(taskDir, "claude_messages.json")
		if (await (0, fs_1.fileExistsAtPath)(oldPath)) {
			const fileContent = await fs.readFile(oldPath, "utf8")
			try {
				const parsedData = JSON.parse(fileContent)
				if (!Array.isArray(parsedData)) {
					console.warn(
						`[readApiMessages] Parsed OLD data is not an array (got ${typeof parsedData}), returning empty. TaskId: ${taskId}, Path: ${oldPath}`,
					)
					return []
				}
				if (parsedData.length === 0) {
					console.error(
						`[Ali-Debug] readApiMessages: Found OLD API conversation history file (claude_messages.json), but it's empty (parsed as []). TaskId: ${taskId}, Path: ${oldPath}`,
					)
				}
				await fs.unlink(oldPath)
				return parsedData
			} catch (error) {
				console.warn(
					`[readApiMessages] Error parsing OLD API conversation history file (claude_messages.json), returning empty. TaskId: ${taskId}, Path: ${oldPath}, Error: ${error}`,
				)
				// DO NOT unlink oldPath if parsing failed.
				return []
			}
		}
	}
	// If we reach here, neither the new nor the old history file was found.
	console.error(
		`[Ali-Debug] readApiMessages: API conversation history file not found for taskId: ${taskId}. Expected at: ${filePath}`,
	)
	return []
}
async function saveApiMessages({ messages, taskId, globalStoragePath }) {
	const taskDir = await (0, storage_1.getTaskDirectoryPath)(globalStoragePath, taskId)
	const filePath = path.join(taskDir, globalFileNames_1.GlobalFileNames.apiConversationHistory)
	await (0, safeWriteJson_1.safeWriteJson)(filePath, messages)
}
