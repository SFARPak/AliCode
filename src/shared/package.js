"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.Package = void 0
const package_json_1 = require("../package.json")
// These ENV variables can be defined by ESBuild when building the extension
// in order to override the values in package.json. This allows us to build
// different extension variants with the same package.json file.
// The build process still needs to emit a modified package.json for consumption
// by VSCode, but that build artifact is not used during the transpile step of
// the build, so we still need this override mechanism.
exports.Package = {
	publisher: package_json_1.publisher,
	// Use the overridden name if provided (set by the build via PKG_NAME),
	// otherwise fall back to the published extension name from package.json.
	name: process.env.PKG_NAME || package_json_1.name,
	version: process.env.PKG_VERSION || package_json_1.version,
	outputChannel: process.env.PKG_OUTPUT_CHANNEL || "AliCode",
	sha: process.env.PKG_SHA,
}
