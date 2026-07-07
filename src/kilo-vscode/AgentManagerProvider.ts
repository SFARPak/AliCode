// Wrapper for AgentManagerProvider from kilo-vscode source
// Adjusted to accept a VS Code extension URI instead of a Host, providing a minimal
// Host implementation required for tests and activation.

import * as vscode from "vscode"
import { AgentManagerProvider as OriginalAgentManagerProvider } from "../../kilocode_tmp/packages/kilo-vscode/src/agent-manager/AgentManagerProvider"

// Minimal Host stub providing only the methods used during tests/activation.
class MinimalHost {
	// The original provider expects a createOutput method returning an OutputChannel.
	createOutput(name: string) {
		return vscode.window.createOutputChannel(name)
	}
	// Stub methods to satisfy the Host interface; they are no-ops for the test environment.
	openDocument(_file: string) {
		/* no-op */
	}
	autoBranchNaming() {
		return undefined
	}
	openExternal(_uri: string) {
		/* no-op */
	}
	// Provide a workspacePath method to satisfy Host interface used in tests.
	workspacePath(): string | undefined {
		return undefined
	}
}

export class AgentManagerProvider extends OriginalAgentManagerProvider {
	constructor(extensionUri: vscode.Uri, connectionService: any) {
		// Provide a MinimalHost instance to the original constructor.
		const host = new MinimalHost() as any
		super(host, connectionService)
	}
}
