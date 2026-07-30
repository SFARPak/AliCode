type PlayTtsOptions = {
	onStart?: () => void
	onStop?: () => void
}
export declare const setTtsEnabled: (enabled: boolean) => boolean
export declare const setTtsSpeed: (newSpeed: number) => number
export declare const playTts: (message: string, options?: PlayTtsOptions) => Promise<void>
export declare const stopTts: () => void
export {}
//# sourceMappingURL=tts.d.ts.map
