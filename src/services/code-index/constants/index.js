"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.GEMINI_MAX_ITEM_TOKENS =
	exports.BATCH_PROCESSING_CONCURRENCY =
	exports.MAX_ITEM_TOKENS =
	exports.MAX_BATCH_TOKENS =
	exports.MAX_PENDING_BATCHES =
	exports.PARSING_CONCURRENCY =
	exports.INITIAL_RETRY_DELAY_MS =
	exports.MAX_BATCH_RETRIES =
	exports.BATCH_SEGMENT_THRESHOLD =
	exports.MAX_LIST_FILES_LIMIT_CODE_INDEX =
	exports.MAX_FILE_SIZE_BYTES =
	exports.QDRANT_CODE_BLOCK_NAMESPACE =
	exports.DEFAULT_MAX_SEARCH_RESULTS =
	exports.DEFAULT_SEARCH_MIN_SCORE =
	exports.MAX_CHARS_TOLERANCE_FACTOR =
	exports.MIN_CHUNK_REMAINDER_CHARS =
	exports.MIN_BLOCK_CHARS =
	exports.MAX_BLOCK_CHARS =
		void 0
const types_1 = require("@ali-code/types")
/**Parser */
exports.MAX_BLOCK_CHARS = 1000
exports.MIN_BLOCK_CHARS = 50
exports.MIN_CHUNK_REMAINDER_CHARS = 200 // Minimum characters for the *next* chunk after a split
exports.MAX_CHARS_TOLERANCE_FACTOR = 1.15 // 15% tolerance for max chars
/**Search */
exports.DEFAULT_SEARCH_MIN_SCORE = types_1.CODEBASE_INDEX_DEFAULTS.DEFAULT_SEARCH_MIN_SCORE
exports.DEFAULT_MAX_SEARCH_RESULTS = types_1.CODEBASE_INDEX_DEFAULTS.DEFAULT_SEARCH_RESULTS
/**File Watcher */
exports.QDRANT_CODE_BLOCK_NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
exports.MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024 // 1MB
/**Directory Scanner */
exports.MAX_LIST_FILES_LIMIT_CODE_INDEX = 50_000
exports.BATCH_SEGMENT_THRESHOLD = 60 // Number of code segments to batch for embeddings/upserts
exports.MAX_BATCH_RETRIES = 3
exports.INITIAL_RETRY_DELAY_MS = 500
exports.PARSING_CONCURRENCY = 10
exports.MAX_PENDING_BATCHES = 20 // Maximum number of batches to accumulate before waiting
/**OpenAI Embedder */
exports.MAX_BATCH_TOKENS = 100000
exports.MAX_ITEM_TOKENS = 8191
exports.BATCH_PROCESSING_CONCURRENCY = 10
/**Gemini Embedder */
exports.GEMINI_MAX_ITEM_TOKENS = 2048
