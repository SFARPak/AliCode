/**
 * Tool parameter type definitions for native protocol
 */
/**
 * Type guard to check if params are in legacy format.
 */
export function isLegacyReadFileParams(params) {
	return "_legacyFormat" in params && params._legacyFormat === true
}
