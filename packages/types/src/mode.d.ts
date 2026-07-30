import { z } from "zod"
/**
 * GroupOptions
 */
export declare const groupOptionsSchema: z.ZodObject<
	{
		fileRegex: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>
		description: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		description?: string | undefined
		fileRegex?: string | undefined
	},
	{
		description?: string | undefined
		fileRegex?: string | undefined
	}
>
export type GroupOptions = z.infer<typeof groupOptionsSchema>
/**
 * GroupEntry
 */
export declare const groupEntrySchema: z.ZodUnion<
	[
		z.ZodEnum<["read", "edit", "command", "mcp", "modes"]>,
		z.ZodTuple<
			[
				z.ZodEnum<["read", "edit", "command", "mcp", "modes"]>,
				z.ZodObject<
					{
						fileRegex: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>
						description: z.ZodOptional<z.ZodString>
					},
					"strip",
					z.ZodTypeAny,
					{
						description?: string | undefined
						fileRegex?: string | undefined
					},
					{
						description?: string | undefined
						fileRegex?: string | undefined
					}
				>,
			],
			null
		>,
	]
>
export type GroupEntry = z.infer<typeof groupEntrySchema>
/**
 * Schema for mode group entries. Preprocesses the input to strip deprecated
 * tool groups (e.g., "browser") before validation, ensuring backward compatibility
 * with older user configs.
 *
 * The type assertion to `z.ZodType<GroupEntry[], z.ZodTypeDef, GroupEntry[]>` is
 * required because `z.preprocess` erases the input type to `unknown`, which
 * propagates through `modeConfigSchema → rooCodeSettingsSchema → createRunSchema`
 * and breaks `zodResolver` generic inference in downstream consumers.
 */
export declare const groupEntryArraySchema: z.ZodType<GroupEntry[], z.ZodTypeDef, GroupEntry[]>
export declare const modeConfigSchema: z.ZodObject<
	{
		slug: z.ZodString
		name: z.ZodString
		roleDefinition: z.ZodString
		whenToUse: z.ZodOptional<z.ZodString>
		description: z.ZodOptional<z.ZodString>
		customInstructions: z.ZodOptional<z.ZodString>
		groups: z.ZodType<
			(
				| "command"
				| "read"
				| "edit"
				| "mcp"
				| "modes"
				| [
						"command" | "read" | "edit" | "mcp" | "modes",
						{
							description?: string | undefined
							fileRegex?: string | undefined
						},
				  ]
			)[],
			z.ZodTypeDef,
			(
				| "command"
				| "read"
				| "edit"
				| "mcp"
				| "modes"
				| [
						"command" | "read" | "edit" | "mcp" | "modes",
						{
							description?: string | undefined
							fileRegex?: string | undefined
						},
				  ]
			)[]
		>
		source: z.ZodOptional<z.ZodEnum<["global", "project"]>>
	},
	"strip",
	z.ZodTypeAny,
	{
		name: string
		slug: string
		roleDefinition: string
		groups: (
			| "command"
			| "read"
			| "edit"
			| "mcp"
			| "modes"
			| [
					"command" | "read" | "edit" | "mcp" | "modes",
					{
						description?: string | undefined
						fileRegex?: string | undefined
					},
			  ]
		)[]
		description?: string | undefined
		source?: "global" | "project" | undefined
		whenToUse?: string | undefined
		customInstructions?: string | undefined
	},
	{
		name: string
		slug: string
		roleDefinition: string
		groups: (
			| "command"
			| "read"
			| "edit"
			| "mcp"
			| "modes"
			| [
					"command" | "read" | "edit" | "mcp" | "modes",
					{
						description?: string | undefined
						fileRegex?: string | undefined
					},
			  ]
		)[]
		description?: string | undefined
		source?: "global" | "project" | undefined
		whenToUse?: string | undefined
		customInstructions?: string | undefined
	}
>
export type ModeConfig = z.infer<typeof modeConfigSchema>
/**
 * CustomModesSettings
 */
export declare const customModesSettingsSchema: z.ZodObject<
	{
		customModes: z.ZodEffects<
			z.ZodArray<
				z.ZodObject<
					{
						slug: z.ZodString
						name: z.ZodString
						roleDefinition: z.ZodString
						whenToUse: z.ZodOptional<z.ZodString>
						description: z.ZodOptional<z.ZodString>
						customInstructions: z.ZodOptional<z.ZodString>
						groups: z.ZodType<
							(
								| "command"
								| "read"
								| "edit"
								| "mcp"
								| "modes"
								| [
										"command" | "read" | "edit" | "mcp" | "modes",
										{
											description?: string | undefined
											fileRegex?: string | undefined
										},
								  ]
							)[],
							z.ZodTypeDef,
							(
								| "command"
								| "read"
								| "edit"
								| "mcp"
								| "modes"
								| [
										"command" | "read" | "edit" | "mcp" | "modes",
										{
											description?: string | undefined
											fileRegex?: string | undefined
										},
								  ]
							)[]
						>
						source: z.ZodOptional<z.ZodEnum<["global", "project"]>>
					},
					"strip",
					z.ZodTypeAny,
					{
						name: string
						slug: string
						roleDefinition: string
						groups: (
							| "command"
							| "read"
							| "edit"
							| "mcp"
							| "modes"
							| [
									"command" | "read" | "edit" | "mcp" | "modes",
									{
										description?: string | undefined
										fileRegex?: string | undefined
									},
							  ]
						)[]
						description?: string | undefined
						source?: "global" | "project" | undefined
						whenToUse?: string | undefined
						customInstructions?: string | undefined
					},
					{
						name: string
						slug: string
						roleDefinition: string
						groups: (
							| "command"
							| "read"
							| "edit"
							| "mcp"
							| "modes"
							| [
									"command" | "read" | "edit" | "mcp" | "modes",
									{
										description?: string | undefined
										fileRegex?: string | undefined
									},
							  ]
						)[]
						description?: string | undefined
						source?: "global" | "project" | undefined
						whenToUse?: string | undefined
						customInstructions?: string | undefined
					}
				>,
				"many"
			>,
			{
				name: string
				slug: string
				roleDefinition: string
				groups: (
					| "command"
					| "read"
					| "edit"
					| "mcp"
					| "modes"
					| [
							"command" | "read" | "edit" | "mcp" | "modes",
							{
								description?: string | undefined
								fileRegex?: string | undefined
							},
					  ]
				)[]
				description?: string | undefined
				source?: "global" | "project" | undefined
				whenToUse?: string | undefined
				customInstructions?: string | undefined
			}[],
			{
				name: string
				slug: string
				roleDefinition: string
				groups: (
					| "command"
					| "read"
					| "edit"
					| "mcp"
					| "modes"
					| [
							"command" | "read" | "edit" | "mcp" | "modes",
							{
								description?: string | undefined
								fileRegex?: string | undefined
							},
					  ]
				)[]
				description?: string | undefined
				source?: "global" | "project" | undefined
				whenToUse?: string | undefined
				customInstructions?: string | undefined
			}[]
		>
	},
	"strip",
	z.ZodTypeAny,
	{
		customModes: {
			name: string
			slug: string
			roleDefinition: string
			groups: (
				| "command"
				| "read"
				| "edit"
				| "mcp"
				| "modes"
				| [
						"command" | "read" | "edit" | "mcp" | "modes",
						{
							description?: string | undefined
							fileRegex?: string | undefined
						},
				  ]
			)[]
			description?: string | undefined
			source?: "global" | "project" | undefined
			whenToUse?: string | undefined
			customInstructions?: string | undefined
		}[]
	},
	{
		customModes: {
			name: string
			slug: string
			roleDefinition: string
			groups: (
				| "command"
				| "read"
				| "edit"
				| "mcp"
				| "modes"
				| [
						"command" | "read" | "edit" | "mcp" | "modes",
						{
							description?: string | undefined
							fileRegex?: string | undefined
						},
				  ]
			)[]
			description?: string | undefined
			source?: "global" | "project" | undefined
			whenToUse?: string | undefined
			customInstructions?: string | undefined
		}[]
	}
>
export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>
/**
 * PromptComponent
 */
export declare const promptComponentSchema: z.ZodObject<
	{
		roleDefinition: z.ZodOptional<z.ZodString>
		whenToUse: z.ZodOptional<z.ZodString>
		description: z.ZodOptional<z.ZodString>
		customInstructions: z.ZodOptional<z.ZodString>
	},
	"strip",
	z.ZodTypeAny,
	{
		description?: string | undefined
		roleDefinition?: string | undefined
		whenToUse?: string | undefined
		customInstructions?: string | undefined
	},
	{
		description?: string | undefined
		roleDefinition?: string | undefined
		whenToUse?: string | undefined
		customInstructions?: string | undefined
	}
>
export type PromptComponent = z.infer<typeof promptComponentSchema>
/**
 * CustomModePrompts
 */
export declare const customModePromptsSchema: z.ZodRecord<
	z.ZodString,
	z.ZodOptional<
		z.ZodObject<
			{
				roleDefinition: z.ZodOptional<z.ZodString>
				whenToUse: z.ZodOptional<z.ZodString>
				description: z.ZodOptional<z.ZodString>
				customInstructions: z.ZodOptional<z.ZodString>
			},
			"strip",
			z.ZodTypeAny,
			{
				description?: string | undefined
				roleDefinition?: string | undefined
				whenToUse?: string | undefined
				customInstructions?: string | undefined
			},
			{
				description?: string | undefined
				roleDefinition?: string | undefined
				whenToUse?: string | undefined
				customInstructions?: string | undefined
			}
		>
	>
>
export type CustomModePrompts = z.infer<typeof customModePromptsSchema>
/**
 * CustomSupportPrompts
 */
export declare const customSupportPromptsSchema: z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodString>>
export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>
/**
 * DEFAULT_MODES
 */
export declare const DEFAULT_MODES: readonly ModeConfig[]
//# sourceMappingURL=mode.d.ts.map
