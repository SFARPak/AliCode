import { Parser as ParserT, Query as QueryT } from "web-tree-sitter"
export interface LanguageParser {
	[key: string]: {
		parser: ParserT
		query: QueryT
	}
}
export declare function loadRequiredLanguageParsers(
	filesToParse: string[],
	sourceDirectory?: string,
): Promise<LanguageParser>
//# sourceMappingURL=languageParser.d.ts.map
