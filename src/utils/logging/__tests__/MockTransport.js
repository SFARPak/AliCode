"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.MockTransport = void 0
// __tests__/MockTransport.ts
const CompactTransport_1 = require("../CompactTransport")
const TEST_CONFIG = {
	level: "fatal",
	fileOutput: {
		enabled: false,
		path: "",
	},
}
class MockTransport extends CompactTransport_1.CompactTransport {
	entries = []
	closed = false
	constructor() {
		super(TEST_CONFIG)
	}
	async write(entry) {
		this.entries.push(entry)
	}
	async close() {
		this.closed = true
		await super.close()
	}
	clear() {
		this.entries = []
		this.closed = false
	}
}
exports.MockTransport = MockTransport
