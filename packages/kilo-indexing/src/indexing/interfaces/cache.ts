export interface ICacheManager {
	get(_key: string): Promise<unknown | null>
	set(_key: string, _value: unknown, _ttl?: number): Promise<void>
	delete(_key: string): Promise<void>
	clear(): Promise<void>
}
