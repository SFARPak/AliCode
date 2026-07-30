"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.taskMetadataSchema = exports.fileMetadataEntrySchema = exports.recordSourceSchema = void 0
const zod_1 = require("zod")
// Zod schema for RecordSource
exports.recordSourceSchema = zod_1.z.enum(["read_tool", "user_edited", "roo_edited", "file_mentioned"])
// Zod schema for FileMetadataEntry
exports.fileMetadataEntrySchema = zod_1.z.object({
	path: zod_1.z.string(),
	record_state: zod_1.z.enum(["active", "stale"]),
	record_source: exports.recordSourceSchema,
	roo_read_date: zod_1.z.number().nullable(),
	roo_edit_date: zod_1.z.number().nullable(),
	user_edit_date: zod_1.z.number().nullable().optional(),
})
// Zod schema for TaskMetadata
exports.taskMetadataSchema = zod_1.z.object({
	files_in_context: zod_1.z.array(exports.fileMetadataEntrySchema),
})
