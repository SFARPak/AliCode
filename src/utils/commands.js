"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.getTerminalCommand = exports.getCodeActionCommand = exports.getCommand = void 0
const package_1 = require("../shared/package")
const getCommand = (id) => `${package_1.Package.name}.${id}`
exports.getCommand = getCommand
const getCodeActionCommand = (id) => `${package_1.Package.name}.${id}`
exports.getCodeActionCommand = getCodeActionCommand
const getTerminalCommand = (id) => `${package_1.Package.name}.${id}`
exports.getTerminalCommand = getTerminalCommand
