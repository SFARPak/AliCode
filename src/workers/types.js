"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.countTokensResultSchema = void 0
const zod_1 = require("zod")
exports.countTokensResultSchema = zod_1.z.discriminatedUnion("success", [
	zod_1.z.object({
		success: zod_1.z.literal(true),
		count: zod_1.z.number(),
	}),
	zod_1.z.object({ success: zod_1.z.literal(false), error: zod_1.z.string() }),
])
