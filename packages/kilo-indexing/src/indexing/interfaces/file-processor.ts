export interface ICodeParser {
	parse(_content: string, _filePath: string): CodeBlock[]
}

export interface IDirectoryScanner {
	scan(_dir: string): Promise<string[]>
}

export interface IFileWatcher {
	watch(_path: string, _callback: (_event: string, _file: string) => void): { dispose: () => void }
}

export interface CodeBlock {
	content: string
	filePath: string
	startLine: number
	endLine: number
	language?: string
}

export interface FileProcessingResult {
	filePath: string
	blocks: CodeBlock[]
	error?: string
}

export interface BatchProcessingSummary {
	totalFiles: number
	processedFiles: number
	totalBlocks: number
	errors: string[]
}
