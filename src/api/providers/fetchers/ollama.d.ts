import { ModelInfo } from "@ali-code/types"
import { z } from "zod"
declare const OllamaModelInfoResponseSchema: z.ZodObject<
	{
		modelfile: z.ZodOptional<z.ZodString>
		parameters: z.ZodOptional<z.ZodString>
		template: z.ZodOptional<z.ZodString>
		details: z.ZodObject<
			{
				family: z.ZodString
				families: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>
				format: z.ZodOptional<z.ZodString>
				parameter_size: z.ZodString
				parent_model: z.ZodOptional<z.ZodString>
				quantization_level: z.ZodOptional<z.ZodString>
			},
			"strip",
			z.ZodTypeAny,
			{
				family: string
				parameter_size: string
				format?: string | undefined
				families?: string[] | null | undefined
				parent_model?: string | undefined
				quantization_level?: string | undefined
			},
			{
				family: string
				parameter_size: string
				format?: string | undefined
				families?: string[] | null | undefined
				parent_model?: string | undefined
				quantization_level?: string | undefined
			}
		>
		model_info: z.ZodRecord<z.ZodString, z.ZodAny>
		capabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>
	},
	"strip",
	z.ZodTypeAny,
	{
		details: {
			family: string
			parameter_size: string
			format?: string | undefined
			families?: string[] | null | undefined
			parent_model?: string | undefined
			quantization_level?: string | undefined
		}
		model_info: Record<string, any>
		capabilities?: string[] | undefined
		parameters?: string | undefined
		modelfile?: string | undefined
		template?: string | undefined
	},
	{
		details: {
			family: string
			parameter_size: string
			format?: string | undefined
			families?: string[] | null | undefined
			parent_model?: string | undefined
			quantization_level?: string | undefined
		}
		model_info: Record<string, any>
		capabilities?: string[] | undefined
		parameters?: string | undefined
		modelfile?: string | undefined
		template?: string | undefined
	}
>
type OllamaModelInfoResponse = z.infer<typeof OllamaModelInfoResponseSchema>
export declare const parseOllamaModel: (rawModel: OllamaModelInfoResponse) => ModelInfo | null
export declare function getOllamaModels(baseUrl?: string, apiKey?: string): Promise<Record<string, ModelInfo>>
export {}
//# sourceMappingURL=ollama.d.ts.map
