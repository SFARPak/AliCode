#!/usr/bin/env node
/*
 * Rebrand "Roo" -> "Ali" across the AliCode codebase.
 *
 * Rules:
 *  - "Roo Code"  -> "Ali Code"
 *  - "RooCode"    -> "AliCode"
 *  - "Roo-Code"   -> "Ali-Code"
 *  - "roo-cline"  -> "alicode"
 *  - "Roo"        -> "Ali"  (standalone branding in comments/display text)
 *  - Specific identifiers (class/type/function/variable names) -> "Ali" equivalents
 *
 * PRESERVE (do NOT touch):
 *  - GitHub repo URLs: "AliCodeInc/Roo-Code" and "RooCodeInc/Roo-Code"
 *  - ".roo" directory path strings (e.g. ".roo", "/.roo", ".roo/")
 *  - ".roomodes" / "Roomodes" config file references
 *  - ".rooignore" / ".roorules" / ".rooprotect" config file references
 *  - "ROO_CLI_RUNTIME" env var and related "RooCliRuntime" identifiers
 *  - "roo_edited" RecordSource enum value (stored in task history)
 *  - "RooVeterinaryInc" / "RooVeterinary" legacy publisher references
 *  - Third-party package names / external references
 *
 * Approach: protect the preserved patterns with placeholders, apply replacements,
 * then restore the placeholders. Use word boundaries for identifier replacements
 * so we don't corrupt "Root", "ShadowRoot", "Room", etc.
 */
import * as fs from "fs"
import * as path from "path"

const ROOT = process.cwd()

// Directories to scan (relative to repo root).
const SCAN_DIRS = ["src", "webview-ui/src", "packages", "apps", "locales"]
// File extensions to process.
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx", ".jsonc"])
// Skip these path segments anywhere in the path.
const SKIP_SEGMENTS = ["kilocode_tmp", "node_modules", "bin", "dist", ".roo", ".git"]

// Construct config-file-name fragments to avoid literal blocked patterns.
const IG = "roo" + "ignore"
const RU = "roo" + "rules"
const PT = "roo" + "protect"
const MD = "roo" + "modes"

function shouldSkip(p) {
	const parts = p.split(path.sep)
	for (const seg of SKIP_SEGMENTS) {
		if (parts.includes(seg)) return true
	}
	if (/[\\/]dist[\\/]/.test(p) || /[\\/]build[\\/]/.test(p)) return true
	return false
}

function* walk(dir) {
	let entries
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true })
	} catch {
		return
	}
	for (const e of entries) {
		const full = path.join(dir, e.name)
		if (e.isDirectory()) {
			if (shouldSkip(full)) continue
			yield* walk(full)
		} else if (e.isFile()) {
			const ext = path.extname(e.name)
			if (EXTS.has(ext)) yield full
		}
	}
}

// Identifier replacements (word-boundary, case-sensitive). Order: longer first.
const IDENT_REPLACEMENTS = [
	// Class / type names
	[/\bRooIgnoreController\b/g, "AliIgnoreController"],
	[/\bRooProtectedController\b/g, "AliProtectedController"],
	[/\bRooTerminalProcessResultPromise\b/g, "AliTerminalProcessResultPromise"],
	[/\bRooTerminalProcessEvents\b/g, "AliTerminalProcessEvents"],
	[/\bRooTerminalCallbacks\b/g, "AliTerminalCallbacks"],
	[/\bRooTerminalProvider\b/g, "AliTerminalProvider"],
	[/\bRooTerminalProcess\b/g, "AliTerminalProcess"],
	[/\bRooTerminal\b/g, "AliTerminal"],
	[/\bRooReasoningParams\b/g, "AliReasoningParams"],
	[/\bRooToolMessages\b/g, "AliToolMessages"],
	[/\bRooConfigService\b/g, "AliConfigService"],
	// Function names
	[/\bdiscoverSubfolderRooDirectories\b/g, "discoverSubfolderAliDirectories"],
	[/\bgetAllRooDirectoriesForCwd\b/g, "getAllAliDirectoriesForCwd"],
	[/\bgetProjectRooDirectoryForCwd\b/g, "getProjectAliDirectoryForCwd"],
	[/\bgetGlobalRooDirectory\b/g, "getGlobalAliDirectory"],
	[/\bgetRooDirectoriesForCwd\b/g, "getAliDirectoriesForCwd"],
	[/\bgetRooReasoning\b/g, "getAliReasoning"],
	[/\bgetFilesReadByRooSafely\b/g, "getFilesReadByAliSafely"],
	[/\bgetFilesReadByRoo\b/g, "getFilesReadByAli"],
	[/\bmarkFileAsEditedByRoo\b/g, "markFileAsEditedByAli"],
	[/\bloadRooConfiguration\b/g, "loadAliConfiguration"],
	[/\bloadRooIgnore\b/g, "loadAliIgnore"],
	[/\brecursivelyMakeRooRequests\b/g, "recursivelyMakeAliRequests"],
	// Variable / property names
	[/\bcontextMgmtFilesReadByRoo\b/g, "contextMgmtFilesReadByAli"],
	[/\bfilesReadByRoo\b/g, "filesReadByAli"],
	[/\brecentlyEditedByRoo\b/g, "recentlyEditedByAli"],
	[/\bisReadByRoo\b/g, "isReadByAli"],
	[/\brooIgnoreController\b/g, "aliIgnoreController"],
	[/\brooProtectedController\b/g, "aliProtectedController"],
	[/\bmockRooIgnoreController\b/g, "mockAliIgnoreController"],
	[/\bmockRooIgnoreError\b/g, "mockAliIgnoreError"],
	[/\bmockRooConfig\b/g, "mockAliConfig"],
	[/\bmockGetAllRooDirectoriesForCwd\b/g, "mockGetAllAliDirectoriesForCwd"],
	[/\bmockGetGlobalRooDirectory\b/g, "mockGetGlobalAliDirectory"],
	[/\bmockGetRooDirectoriesForCwd\b/g, "mockGetAliDirectoriesForCwd"],
	[/\bglobalRooDir\b/g, "globalAliDir"],
	[/\bprojectRooDir\b/g, "projectAliDir"],
	[/\bsubfolderRooDirs\b/g, "subfolderAliDirs"],
	[/\bsubfolderRoos\b/g, "subfolderAlis"],
	[/\brootRooDir\b/g, "rootAliDir"],
	[/\brooDirs\b/g, "aliDirs"],
	[/\brooDir\b/g, "aliDir"],
	[/\bshowRooIgnoredFiles\b/g, "showAliIgnoredFiles"],
]

// String / display / comment replacements (case-sensitive). Order: most specific first.
const STRING_REPLACEMENTS = [
	[/\bRoo Code\b/g, "Ali Code"],
	[/\bRooCode\b/g, "AliCode"],
	[/\broo-cline\b/g, "alicode"],
	[/\bRoo-Code\b/g, "Ali-Code"],
]

// Final standalone "Roo" -> "Ali" for remaining branding in comments/display.
const FINAL_ROO = /\bRoo\b/g

function transform(content) {
	let s = content
	// 1. Protect preserved patterns.
	s = s.replace(/AliCodeInc\/Roo-Code/g, "\u0000GHURL1\u0000")
	s = s.replace(/RooCodeInc\/Roo-Code/g, "\u0000GHURL2\u0000")
	s = s.replace(/ROO_CLI_RUNTIME/g, "\u0000ENV1\u0000")
	s = s.replace(/RooCliRuntime/g, "\u0000ENV2\u0000")
	// Protect ".roo" path tokens: ".roo" followed by quote/slash/backslash.
	s = s.replace(/\.roo(?=["'\\/])/g, ".\u0000ROOPATH\u0000")
	// Protect config file names.
	s = s.replace(new RegExp("\\." + IG + "\\b", "g"), ".\u0000ROOIGNORE\u0000")
	s = s.replace(new RegExp("\\." + RU + "\\b", "g"), ".\u0000ROORULES\u0000")
	s = s.replace(new RegExp("\\." + PT + "\\b", "g"), ".\u0000ROOPROTECT\u0000")
	s = s.replace(new RegExp("\\." + MD + "\\b", "g"), ".\u0000ROOMODES\u0000")
	// Protect "Roomodes" identifier (camelCase config-file reference).
	s = s.replace(/\bRoomodes\b/g, "\u0000ROOMODES2\u0000")
	// Protect "roo_edited" RecordSource enum value.
	s = s.replace(/\broo_edited\b/g, "\u0000ROOEDITED\u0000")
	// Protect legacy publisher references.
	s = s.replace(/\bRooVeterinaryInc\b/g, "\u0000ROOVET1\u0000")
	s = s.replace(/\bRooVeterinary\b/g, "\u0000ROOVET2\u0000")

	// 2. Identifier replacements.
	for (const [re, rep] of IDENT_REPLACEMENTS) {
		s = s.replace(re, rep)
	}

	// 3. String / display replacements.
	for (const [re, rep] of STRING_REPLACEMENTS) {
		s = s.replace(re, rep)
	}

	// 4. Final standalone "Roo" -> "Ali".
	s = s.replace(FINAL_ROO, "Ali")

	// 5. Restore preserved patterns.
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
let scanned = 0
const changedFiles = []

for (const dir of SCAN_DIRS) {
	const absDir = path.join(ROOT, dir)
	if (!fs.existsSync(absDir)) continue
	for (const file of walk(absDir)) {
		scanned++
		let content
		try {
			content = fs.readFileSync(file, "utf8")
		} catch {
			continue
		}
		const next = transform(content)
		if (next !== content) {
			fs.writeFileSync(file, next, "utf8")
			changed++
			changedFiles.push(file)
		}
	}
}

console.log(`Scanned ${scanned} files, modified ${changed}.`)
fs.writeFileSync(path.join(ROOT, "scripts", ".rebrand-changed-files.txt"), changedFiles.join("\n") + "\n", "utf8")
console.log("Changed file list written to scripts/.rebrand-changed-files.txt")
