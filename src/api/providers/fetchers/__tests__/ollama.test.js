"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const axios_1 = __importDefault(require("axios"))
const ollama_1 = require("../ollama")
const ollama_model_details_json_1 = __importDefault(require("./fixtures/ollama-model-details.json"))
// Mock axios
vi.mock("axios")
const mockedAxios = axios_1.default
describe("Ollama Fetcher", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})
	describe("parseOllamaModel", () => {
		it("should correctly parse Ollama model info", () => {
			const modelData = ollama_model_details_json_1.default["qwen3-2to16:latest"]
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelData)
			expect(parsedModel).toEqual({
				maxTokens: 40960,
				contextWindow: 40960,
				supportsImages: false,
				supportsPromptCache: true,
				inputPrice: 0,
				outputPrice: 0,
				cacheWritesPrice: 0,
				cacheReadsPrice: 0,
				description: "Family: qwen3, Context: 40960, Size: 32.8B",
			})
		})
		it("should handle models with null families field", () => {
			const modelDataWithNullFamilies = {
				...ollama_model_details_json_1.default["qwen3-2to16:latest"],
				details: {
					...ollama_model_details_json_1.default["qwen3-2to16:latest"].details,
					families: null,
				},
			}
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelDataWithNullFamilies)
			expect(parsedModel).toEqual({
				maxTokens: 40960,
				contextWindow: 40960,
				supportsImages: false,
				supportsPromptCache: true,
				inputPrice: 0,
				outputPrice: 0,
				cacheWritesPrice: 0,
				cacheReadsPrice: 0,
				description: "Family: qwen3, Context: 40960, Size: 32.8B",
			})
		})
		it("should return null when capabilities does not include 'tools'", () => {
			const modelDataWithoutTools = {
				...ollama_model_details_json_1.default["qwen3-2to16:latest"],
				capabilities: ["completion"], // No "tools" capability
			}
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelDataWithoutTools)
			// Models without tools capability are filtered out (return null)
			expect(parsedModel).toBeNull()
		})
		it("should return model info when capabilities includes 'tools'", () => {
			const modelDataWithTools = {
				...ollama_model_details_json_1.default["qwen3-2to16:latest"],
				capabilities: ["completion", "tools"], // Has "tools" capability
			}
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelDataWithTools)
			expect(parsedModel).not.toBeNull()
			expect(parsedModel.contextWindow).toBeGreaterThan(0)
		})
		it("should return null when capabilities is undefined (no tool support)", () => {
			const modelDataWithoutCapabilities = {
				...ollama_model_details_json_1.default["qwen3-2to16:latest"],
				capabilities: undefined, // No capabilities array
			}
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelDataWithoutCapabilities)
			// Models without explicit tools capability are filtered out
			expect(parsedModel).toBeNull()
		})
		it("should return null when model has vision but no tools capability", () => {
			const modelDataWithVision = {
				...ollama_model_details_json_1.default["qwen3-2to16:latest"],
				capabilities: ["completion", "vision"],
			}
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelDataWithVision)
			// No "tools" capability means filtered out
			expect(parsedModel).toBeNull()
		})
		it("should return model with both vision and tools when both capabilities present", () => {
			const modelDataWithBoth = {
				...ollama_model_details_json_1.default["qwen3-2to16:latest"],
				capabilities: ["completion", "vision", "tools"],
			}
			const parsedModel = (0, ollama_1.parseOllamaModel)(modelDataWithBoth)
			expect(parsedModel).not.toBeNull()
			expect(parsedModel.supportsImages).toBe(true)
			expect(parsedModel.contextWindow).toBeGreaterThan(0)
		})
	})
	describe("getOllamaModels", () => {
		it("should fetch model list from /api/tags and include models with tools capability", async () => {
			const baseUrl = "http://localhost:11434"
			const modelName = "devstral2to16:latest"
			const mockApiTagsResponse = {
				models: [
					{
						name: modelName,
						model: modelName,
						modified_at: "2025-06-03T09:23:22.610222878-04:00",
						size: 14333928010,
						digest: "6a5f0c01d2c96c687d79e32fdd25b87087feb376bf9838f854d10be8cf3c10a5",
						details: {
							family: "llama",
							families: ["llama"],
							format: "gguf",
							parameter_size: "23.6B",
							parent_model: "",
							quantization_level: "Q4_K_M",
						},
					},
				],
			}
			const mockApiShowResponse = {
				license: "Mock License",
				modelfile: "FROM /path/to/blob\nTEMPLATE {{ .Prompt }}",
				parameters: "num_ctx 4096\nstop_token <eos>",
				template: "{{ .System }}USER: {{ .Prompt }}ASSISTANT:",
				modified_at: "2025-06-03T09:23:22.610222878-04:00",
				details: {
					parent_model: "",
					format: "gguf",
					family: "llama",
					families: ["llama"],
					parameter_size: "23.6B",
					quantization_level: "Q4_K_M",
				},
				model_info: {
					"ollama.context_length": 4096,
					"some.other.info": "value",
				},
				capabilities: ["completion", "tools"], // Has tools capability
			}
			mockedAxios.get.mockResolvedValueOnce({ data: mockApiTagsResponse })
			mockedAxios.post.mockResolvedValueOnce({ data: mockApiShowResponse })
			const result = await (0, ollama_1.getOllamaModels)(baseUrl)
			expect(mockedAxios.get).toHaveBeenCalledTimes(1)
			expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/api/tags`, { headers: {} })
			expect(mockedAxios.post).toHaveBeenCalledTimes(1)
			expect(mockedAxios.post).toHaveBeenCalledWith(`${baseUrl}/api/show`, { model: modelName }, { headers: {} })
			expect(typeof result).toBe("object")
			expect(result).not.toBeInstanceOf(Array)
			expect(Object.keys(result).length).toBe(1)
			expect(result[modelName]).toBeDefined()
			const expectedParsedDetails = (0, ollama_1.parseOllamaModel)(mockApiShowResponse)
			expect(result[modelName]).toEqual(expectedParsedDetails)
		})
		it("should filter out models without tools capability", async () => {
			const baseUrl = "http://localhost:11434"
			const modelName = "no-tools-model:latest"
			const mockApiTagsResponse = {
				models: [
					{
						name: modelName,
						model: modelName,
						modified_at: "2025-06-03T09:23:22.610222878-04:00",
						size: 14333928010,
						digest: "6a5f0c01d2c96c687d79e32fdd25b87087feb376bf9838f854d10be8cf3c10a5",
						details: {
							family: "llama",
							families: ["llama"],
							format: "gguf",
							parameter_size: "23.6B",
							parent_model: "",
							quantization_level: "Q4_K_M",
						},
					},
				],
			}
			const mockApiShowResponse = {
				license: "Mock License",
				modelfile: "FROM /path/to/blob\nTEMPLATE {{ .Prompt }}",
				parameters: "num_ctx 4096\nstop_token <eos>",
				template: "{{ .System }}USER: {{ .Prompt }}ASSISTANT:",
				modified_at: "2025-06-03T09:23:22.610222878-04:00",
				details: {
					parent_model: "",
					format: "gguf",
					family: "llama",
					families: ["llama"],
					parameter_size: "23.6B",
					quantization_level: "Q4_K_M",
				},
				model_info: {
					"ollama.context_length": 4096,
					"some.other.info": "value",
				},
				capabilities: ["completion"], // No tools capability
			}
			mockedAxios.get.mockResolvedValueOnce({ data: mockApiTagsResponse })
			mockedAxios.post.mockResolvedValueOnce({ data: mockApiShowResponse })
			const result = await (0, ollama_1.getOllamaModels)(baseUrl)
			// Model without tools capability should be filtered out
			expect(Object.keys(result).length).toBe(0)
			expect(result[modelName]).toBeUndefined()
		})
		it("should return an empty list if the initial /api/tags call fails", async () => {
			const baseUrl = "http://localhost:11434"
			mockedAxios.get.mockRejectedValueOnce(new Error("Network error"))
			const consoleInfoSpy = vi.spyOn(console, "error").mockImplementation(() => {}) // Spy and suppress output
			const result = await (0, ollama_1.getOllamaModels)(baseUrl)
			expect(mockedAxios.get).toHaveBeenCalledTimes(1)
			expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/api/tags`, { headers: {} })
			expect(mockedAxios.post).not.toHaveBeenCalled()
			expect(result).toEqual({})
		})
		it("should log an info message and return an empty object on ECONNREFUSED", async () => {
			const baseUrl = "http://localhost:11434"
			const consoleInfoSpy = vi.spyOn(console, "warn").mockImplementation(() => {}) // Spy and suppress output
			const econnrefusedError = new Error("Connection refused")
			econnrefusedError.code = "ECONNREFUSED"
			mockedAxios.get.mockRejectedValueOnce(econnrefusedError)
			const result = await (0, ollama_1.getOllamaModels)(baseUrl)
			expect(mockedAxios.get).toHaveBeenCalledTimes(1)
			expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/api/tags`, { headers: {} })
			expect(mockedAxios.post).not.toHaveBeenCalled()
			expect(consoleInfoSpy).toHaveBeenCalledWith(`Failed connecting to Ollama at ${baseUrl}`)
			expect(result).toEqual({})
			consoleInfoSpy.mockRestore() // Restore original console.info
		})
		it("should handle models with null families field in API response", async () => {
			const baseUrl = "http://localhost:11434"
			const modelName = "test-model:latest"
			const mockApiTagsResponse = {
				models: [
					{
						name: modelName,
						model: modelName,
						modified_at: "2025-06-03T09:23:22.610222878-04:00",
						size: 14333928010,
						digest: "6a5f0c01d2c96c687d79e32fdd25b87087feb376bf9838f854d10be8cf3c10a5",
						details: {
							family: "llama",
							families: null, // This is the case we're testing
							format: "gguf",
							parameter_size: "23.6B",
							parent_model: "",
							quantization_level: "Q4_K_M",
						},
					},
				],
			}
			const mockApiShowResponse = {
				license: "Mock License",
				modelfile: "FROM /path/to/blob\nTEMPLATE {{ .Prompt }}",
				parameters: "num_ctx 4096\nstop_token <eos>",
				template: "{{ .System }}USER: {{ .Prompt }}ASSISTANT:",
				modified_at: "2025-06-03T09:23:22.610222878-04:00",
				details: {
					parent_model: "",
					format: "gguf",
					family: "llama",
					families: null, // This is the case we're testing
					parameter_size: "23.6B",
					quantization_level: "Q4_K_M",
				},
				model_info: {
					"ollama.context_length": 4096,
					"some.other.info": "value",
				},
				capabilities: ["completion", "tools"], // Has tools capability
			}
			mockedAxios.get.mockResolvedValueOnce({ data: mockApiTagsResponse })
			mockedAxios.post.mockResolvedValueOnce({ data: mockApiShowResponse })
			const result = await (0, ollama_1.getOllamaModels)(baseUrl)
			expect(mockedAxios.get).toHaveBeenCalledTimes(1)
			expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/api/tags`, { headers: {} })
			expect(mockedAxios.post).toHaveBeenCalledTimes(1)
			expect(mockedAxios.post).toHaveBeenCalledWith(`${baseUrl}/api/show`, { model: modelName }, { headers: {} })
			expect(typeof result).toBe("object")
			expect(result).not.toBeInstanceOf(Array)
			expect(Object.keys(result).length).toBe(1)
			expect(result[modelName]).toBeDefined()
			// Verify the model was parsed correctly despite null families
			expect(result[modelName].description).toBe("Family: llama, Context: 4096, Size: 23.6B")
		})
		it("should include Authorization header when API key is provided", async () => {
			const baseUrl = "http://localhost:11434"
			const apiKey = "test-api-key-123"
			const modelName = "test-model:latest"
			const mockApiTagsResponse = {
				models: [
					{
						name: modelName,
						model: modelName,
						modified_at: "2025-06-03T09:23:22.610222878-04:00",
						size: 14333928010,
						digest: "6a5f0c01d2c96c687d79e32fdd25b87087feb376bf9838f854d10be8cf3c10a5",
						details: {
							family: "llama",
							families: ["llama"],
							format: "gguf",
							parameter_size: "23.6B",
							parent_model: "",
							quantization_level: "Q4_K_M",
						},
					},
				],
			}
			const mockApiShowResponse = {
				license: "Mock License",
				modelfile: "FROM /path/to/blob\nTEMPLATE {{ .Prompt }}",
				parameters: "num_ctx 4096\nstop_token <eos>",
				template: "{{ .System }}USER: {{ .Prompt }}ASSISTANT:",
				modified_at: "2025-06-03T09:23:22.610222878-04:00",
				details: {
					parent_model: "",
					format: "gguf",
					family: "llama",
					families: ["llama"],
					parameter_size: "23.6B",
					quantization_level: "Q4_K_M",
				},
				model_info: {
					"ollama.context_length": 4096,
					"some.other.info": "value",
				},
				capabilities: ["completion", "tools"], // Has tools capability
			}
			mockedAxios.get.mockResolvedValueOnce({ data: mockApiTagsResponse })
			mockedAxios.post.mockResolvedValueOnce({ data: mockApiShowResponse })
			const result = await (0, ollama_1.getOllamaModels)(baseUrl, apiKey)
			const expectedHeaders = { Authorization: `Bearer ${apiKey}` }
			expect(mockedAxios.get).toHaveBeenCalledTimes(1)
			expect(mockedAxios.get).toHaveBeenCalledWith(`${baseUrl}/api/tags`, { headers: expectedHeaders })
			expect(mockedAxios.post).toHaveBeenCalledTimes(1)
			expect(mockedAxios.post).toHaveBeenCalledWith(
				`${baseUrl}/api/show`,
				{ model: modelName },
				{ headers: expectedHeaders },
			)
			expect(typeof result).toBe("object")
			expect(result).not.toBeInstanceOf(Array)
			expect(Object.keys(result).length).toBe(1)
			expect(result[modelName]).toBeDefined()
		})
	})
})
