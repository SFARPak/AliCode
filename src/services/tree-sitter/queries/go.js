"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
/*
Go Tree-Sitter Query Patterns
Updated to capture full declarations instead of just identifiers
*/
exports.default = `
; Function declarations - capture the entire declaration
(function_declaration) @name.definition.function

; Method declarations - capture the entire declaration
(method_declaration) @name.definition.method

; Type declarations (interfaces, structs, type aliases) - capture the entire declaration
(type_declaration) @name.definition.type

; Variable declarations - capture the entire declaration
(var_declaration) @name.definition.var

; Constant declarations - capture the entire declaration  
(const_declaration) @name.definition.const

; Package clause
(package_clause) @name.definition.package

; Import declarations - capture the entire import block
(import_declaration) @name.definition.import
`
