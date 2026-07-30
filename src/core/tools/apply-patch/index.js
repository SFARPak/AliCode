"use strict"
/**
 * apply_patch tool module
 *
 * A stripped-down, file-oriented diff format designed to be easy to parse and safe to apply.
 * Based on the Codex apply_patch specification.
 */
Object.defineProperty(exports, "__esModule", { value: true })
exports.ApplyPatchError =
	exports.processAllHunks =
	exports.processHunk =
	exports.applyChunksToContent =
	exports.seekSequence =
	exports.ParseError =
	exports.parsePatch =
		void 0
var parser_1 = require("./parser")
Object.defineProperty(exports, "parsePatch", {
	enumerable: true,
	get: function () {
		return parser_1.parsePatch
	},
})
Object.defineProperty(exports, "ParseError", {
	enumerable: true,
	get: function () {
		return parser_1.ParseError
	},
})
var seek_sequence_1 = require("./seek-sequence")
Object.defineProperty(exports, "seekSequence", {
	enumerable: true,
	get: function () {
		return seek_sequence_1.seekSequence
	},
})
var apply_1 = require("./apply")
Object.defineProperty(exports, "applyChunksToContent", {
	enumerable: true,
	get: function () {
		return apply_1.applyChunksToContent
	},
})
Object.defineProperty(exports, "processHunk", {
	enumerable: true,
	get: function () {
		return apply_1.processHunk
	},
})
Object.defineProperty(exports, "processAllHunks", {
	enumerable: true,
	get: function () {
		return apply_1.processAllHunks
	},
})
Object.defineProperty(exports, "ApplyPatchError", {
	enumerable: true,
	get: function () {
		return apply_1.ApplyPatchError
	},
})
