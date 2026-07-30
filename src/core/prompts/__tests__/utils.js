"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.toPosix = toPosix
// Make a path take a unix-like form.  Useful for making path comparisons.
function toPosix(filePath) {
	return filePath.toString().toPosix()
}
