#!/usr/bin/env node
// Second-pass: rename remaining Roo identifiers missed by the first pass.
import * as fs from "fs"
import * as path from "path"

const ROOT = process.cwd()
const SCAN_DIRS = ["src", "webview-ui/src", "packages", "apps", "locales"]
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx", ".jsonc"])
const SKIP_SEGMENTS = ["kilocode_tmp", "node_modules", "bin", "dist", ".roo", ".git"]
const IG = "roo" + "ignore"
const RU = "roo" + "rules"
const PT = "roo" + "protect"
const MD = "roo" + "modes"

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

const IDENT_REPLACEMENTS = [
	[/\buseRooPortal\b/g, "useAliPortal"],
	[/\bMockRooHero\b/g, "MockAliHero"],
	[/\bMockRooTips\b/g, "MockAliTips"],
	[/\btaskRooIgnoreController\b/g, "taskAliIgnoreController"],
	[/\btaskRooProtectedController\b/g, "taskAliProtectedController"],
	// re-export path in hooks/index.ts
	[/\.\/useRooPortal\b/g, "./useAliPortal"],
]

function transform(content) {
	let s = content
	// Protect preserved patterns (same as first pass).
	s = s.replace(/AliCodeInc\/Roo-Code/g, "\u0000GHURL1\u0000")
	s = s.replace(/RooCodeInc\/Roo-Code/g, "\u0000GHURL2\u0000")
	s = s.replace(/ROO_CLI_RUNTIME/g, "\u0000ENV1\u0000")
	s = s.replace(/RooCliRuntime/g, "\u0000ENV2\u0000")
	s = s.replace(/\.roo(?=["'\\/])/g, ".\u0000ROOPATH\u0000")
	s = s.replace(new RegExp("\\." + IG + "\\b", "g"), ".\u0000ROOIGNORE\u0000")
	s = s.replace(new RegExp("\\." + RU + "\\b", "g"), ".\u0000ROORULES\u0000")
	s = s.replace(new RegExp("\\." + PT + "\\b", "g"), ".\u0000ROOPROTECT\u0000")
	s = s.replace(new RegExp("\\." + MD + "\\b", "g"), ".\u0000ROOMODES\u0000")
	s = s.replace(/\bRoomodes\b/g, "\u0000ROOMODES2\u0000")
	s = s.replace(/\broo_edited\b/g, "\u0000ROOEDITED\u0000")
	s = s.replace(/\bRooVeterinaryInc\b/g, "\u0000ROOVET1\u0000")
	s = s.replace(/\bRooVeterinary\b/g, "\u0000ROOVET2\u0000")

	for (const [re, rep] of IDENT_REPLACEMENTS) s = s.replace(re, rep)

	s = s.replace(/\u0000GHURL1\u0000/g, "AliCodeInc/Roo-Code")
	s = s.replace(/\u0000GHURL2\u0000/g, "RooCodeInc/Roo-Code")
	s = s.replace(/\u0000ENV1\u0000/g, "ROO_CLI_RUNTIME")
	s = s.replace(/\u0000ENV2\u0000/g, "RooCliRuntime")
	s = s.replace(/\.\u0000ROOPATH\u0000/g, ".roo")
	s = s.replace(/\.\u0000ROOIGNORE\u0000/g, "." + IG)
	s = s.replace(/\.\u0000ROORULES\u0000/g, "." + RU)
	s = s.replace(/\.\u0000ROOPROTECT\u0000/g, "." + PT)
	s = s.replace(/\.\u0000ROOMODES\u0000/g, "." + MD)
	s = s.replace(/\u0000ROOMODES2\u0000/g, "Roomodes")
	s = s.replace(/\u0000ROOEDITED\u0000/g, "roo_edited")
	s = s.replace(/\u0000ROOVET1\u0000/g, "RooVeterinaryInc")
	s = s.replace(/\u0000ROOVET2\u0000/g, "RooVeterinary")
	return s
}

let changed = 0
for (const dir of SCAN_DIRS) {
	const absDir = path.join(ROOT, dir)
	if (!fs.existsSync(absDir)) continue
	for (const file of walk(absDir)) {
		let content
		try { content = fs.readFileSync(file, "utf8") } catch { continue }
		const next = transform(content)
		if (next !== content) { fs.writeFileSync(file, next, "utf8"); changed++ }
	}
}
console.log(`Second pass: modified ${changed} files.`)
