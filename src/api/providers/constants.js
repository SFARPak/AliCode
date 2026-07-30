"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.DEFAULT_HEADERS = void 0
const package_1 = require("../../shared/package")
exports.DEFAULT_HEADERS = {
	"HTTP-Referer": "https://github.com/AliCodeInc/Ali-Code",
	"X-Title": "AliCode",
	"User-Agent": `AliCode/${package_1.Package.version}`,
}
