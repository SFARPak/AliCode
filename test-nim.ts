// Simple script to list all NVIDIA NIM model IDs
import { nvidiaNimModels } from "./packages/types/src/providers/nvidia-nim"

function main() {
	for (const modelId of Object.keys(nvidiaNimModels)) {
		console.log(`Model: ${modelId}`)
	}
}

main()
