export type InjectableConfigType =
	| string
	| {
			[key: string]:
				| undefined
				| null
				| boolean
				| number
				| InjectableConfigType
				| Array<undefined | null | boolean | number | InjectableConfigType>
	  }
/**
 * Deeply injects environment variables into a configuration object/string/json
 *
 * Uses VSCode env:name pattern: https://code.visualstudio.com/docs/reference/variables-reference#_environment-variables
 *
 * Does not mutate original object
 */
export declare function injectEnv<C extends InjectableConfigType>(
	config: C,
	notFoundValue?: any,
): Promise<C extends string ? string : C>
/**
 * Deeply injects variables into a configuration object/string/json
 *
 * Uses VSCode's variables reference pattern: https://code.visualstudio.com/docs/reference/variables-reference#_environment-variables
 *
 * Does not mutate original object
 *
 * There is a special handling for a nested (record-type) variables, where it is replaced by `propNotFoundValue` (if available) if the root key exists but the nested key does not.
 *
 * Matched keys that have `null` | `undefined` values are treated as not found.
 */
export declare function injectVariables<C extends InjectableConfigType>(
	config: C,
	variables: Record<string, undefined | null | string | Record<string, undefined | null | string>>,
	propNotFoundValue?: any,
): Promise<C extends string ? string : C>
//# sourceMappingURL=config.d.ts.map
