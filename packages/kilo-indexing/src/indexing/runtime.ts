export interface Emitter {
	on(_event: string, _listener: (..._args: unknown[]) => void): void
	off(_event: string, _listener: (..._args: unknown[]) => void): void
}

export interface Disposable {
	dispose(): void
}
