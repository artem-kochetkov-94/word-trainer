export interface ICacheManager {
	set(key: string, data: string): void;
	get(key: string): string | null;
	delete(key: string): void;
}
