"use strict"
/**
 * Worktree Module
 *
 * VSCode-specific handlers for git worktree management.
 * Bridges webview messages to the platform-agnostic core services.
 */
Object.defineProperty(exports, "__esModule", { value: true })
exports.handleCheckoutBranch =
	exports.handleCreateWorktreeInclude =
	exports.handleCheckBranchWorktreeInclude =
	exports.handleGetWorktreeIncludeStatus =
	exports.handleGetWorktreeDefaults =
	exports.handleGetAvailableBranches =
	exports.handleSwitchWorktree =
	exports.handleDeleteWorktree =
	exports.handleCreateWorktree =
	exports.handleListWorktrees =
		void 0
var handlers_1 = require("./handlers")
Object.defineProperty(exports, "handleListWorktrees", {
	enumerable: true,
	get: function () {
		return handlers_1.handleListWorktrees
	},
})
Object.defineProperty(exports, "handleCreateWorktree", {
	enumerable: true,
	get: function () {
		return handlers_1.handleCreateWorktree
	},
})
Object.defineProperty(exports, "handleDeleteWorktree", {
	enumerable: true,
	get: function () {
		return handlers_1.handleDeleteWorktree
	},
})
Object.defineProperty(exports, "handleSwitchWorktree", {
	enumerable: true,
	get: function () {
		return handlers_1.handleSwitchWorktree
	},
})
Object.defineProperty(exports, "handleGetAvailableBranches", {
	enumerable: true,
	get: function () {
		return handlers_1.handleGetAvailableBranches
	},
})
Object.defineProperty(exports, "handleGetWorktreeDefaults", {
	enumerable: true,
	get: function () {
		return handlers_1.handleGetWorktreeDefaults
	},
})
Object.defineProperty(exports, "handleGetWorktreeIncludeStatus", {
	enumerable: true,
	get: function () {
		return handlers_1.handleGetWorktreeIncludeStatus
	},
})
Object.defineProperty(exports, "handleCheckBranchWorktreeInclude", {
	enumerable: true,
	get: function () {
		return handlers_1.handleCheckBranchWorktreeInclude
	},
})
Object.defineProperty(exports, "handleCreateWorktreeInclude", {
	enumerable: true,
	get: function () {
		return handlers_1.handleCreateWorktreeInclude
	},
})
Object.defineProperty(exports, "handleCheckoutBranch", {
	enumerable: true,
	get: function () {
		return handlers_1.handleCheckoutBranch
	},
})
