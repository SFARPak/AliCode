"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.allowNetConnect = allowNetConnect
const nock_1 = __importDefault(require("nock"))
require("./utils/path") // Import to enable String.prototype.toPosix().
// Disable network requests by default for all tests.
nock_1.default.disableNetConnect()
function allowNetConnect(host) {
	if (host) {
		nock_1.default.enableNetConnect(host)
	} else {
		nock_1.default.enableNetConnect()
	}
}
// Global mocks that many tests expect.
global.structuredClone = global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)))
