declare global {
	namespace NodeJS {
		interface Global {
			__TEST_ENV__: {
				platform: string
				isPowerShellAvailable: boolean
			}
		}
	}
}
export {}
//# sourceMappingURL=setupTerminalTests.d.ts.map
