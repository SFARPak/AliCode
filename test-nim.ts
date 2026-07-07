import { OpenAI } from "openai"

const client = new OpenAI({
	baseURL: "https://integrate.api.nvidia.com/v1/",
	apiKey: "faketoken",
	defaultHeaders: {
		"HTTP-Referer": "https://github.com/RooVetGit/Roo-Cline",
		"X-Title": "Roo Code",
		"User-Agent": "RooCode/1.0",
	},
})

async function main() {
	try {
		await client.chat.completions.create({
			model: "deepseek-ai/deepseek-r1",
			messages: [{ role: "user", content: "hi" }],
		})
	} catch (err: any) {
		console.log("Status:", err.status)
		console.log("Message:", err.message)
	}
}
main()
