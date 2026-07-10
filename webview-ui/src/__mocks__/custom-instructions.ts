export async function addCustomInstructions(
	customInstructions: string,
	globalInstructions: string,
	cwd: string,
	mode: string,
	options: { language?: string } = {},
): Promise<string> {
	return customInstructions || ""
}
