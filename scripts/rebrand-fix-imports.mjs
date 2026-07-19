#!/usr/bin/env node
// Update import path strings and portal IDs after file renames.
import * as fs from "fs"
import * as path from "path"

const ROOT = process.cwd()
const SCAN_DIRS = ["src", "webview-ui/src", "packages", "apps"]
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx", ".jsonc"])
const SKIP_SEGMENTS = ["kilocode_tmp", "node_modules", "bin", "dist", ".roo", ".git"]

function shouldSkip(p) {
	const parts = p.split(path.sep)
	for (const seg of SKIP_SEGMENTS) if (parts.includes(seg)) return true
	if (/[\\/]dist[\\/]/.test(p) || /[\\/]build[\\/]/.test(p)) return true
	return false
}
function* walk(dir) {
	let entries
	try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
	for (const e of entries) {
		const full = path.join(dir, e.name)
		if (e.isDirectory()) { if (!shouldSkip(full)) yield* walk(full) }
		else if (e.isFile() && EXTS.has(path.extname(e.name))) yield full
	}
}

// Path-string replacements (order: longer/specific first).
const REPL = [
	// File-path import strings (case-sensitive). Match the filename portion.
	[/ignore\/RooIgnoreController/g, "ignore/AliIgnoreController"],
	[/ignore\/__mocks__\/RooIgnoreController/g, "ignore/__mocks__/AliIgnoreController"],
	[/ignore\/__tests__\/RooIgnoreController\.security\.spec/g, "ignore/__tests__/AliIgnoreController.security.spec"],
	[/ignore\/__tests__\/RooIgnoreController\.spec/g, "ignore/__tests__/AliIgnoreController.spec"],
	[/protect\/RooProtectedController/g, "protect/AliProtectedController"],
	[/protect\/__tests__\/RooProtectedController\.spec/g, "protect/__tests__/AliProtectedController.spec"],
	[/responses-rooignore\.spec/g, "responses-aliignore.spec"],
	[/hooks\/useRooPortal/g, "hooks/useAliPortal"],
	[/welcome\/RooHero/g, "welcome/AliHero"],
	[/welcome\/RooTips/g, "welcome/AliTips"],
	[/welcome\/__tests__\/RooTips\.spec/g, "welcome/__tests__/AliTips.spec"],
	// Portal ID string literal used by the portal hook.
	[/"roo-portal"/g, '"ali-portal"'],
	[/'roo-portal'/g, "'ali-portal'"],
	[/`roo-portal`/g, "`ali-portal`"],
]

let changed = 0
for (const dir of SCAN_DIRS) {
	const absDir = path.join(ROOT, dir)
	if (!fs.existsSync(absDir)) continue
	for (const file of walk(absDir)) {
		let content
		try { content = fs.readFileSync(file, "utf8") } catch { continue }
		let next = content
		for (const [re, rep] of REPL) next = next.replace(re, rep)
		if (next !== content) { fs.writeFileSync(file, next, "utf8"); changed++ }
	}
}
console.log(`Updated import paths in ${changed} files.`)
