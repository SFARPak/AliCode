import { CompactTransport } from "../CompactTransport"
import type { CompactLogEntry } from "../types"
export declare class MockTransport extends CompactTransport {
	entries: CompactLogEntry[]
	closed: boolean
	constructor()
	write(entry: CompactLogEntry): Promise<void>
	close(): Promise<void>
	clear(): void
}
//# sourceMappingURL=MockTransport.d.ts.map
