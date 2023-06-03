import { ICacheManager } from "./cacheManager.interface";

export class CacheManager implements ICacheManager {
  private storage = localStorage;

  set(key: string, data: string): void {
    this.storage.setItem(key, data);
  }

  get(key: string): string | null {
    return this.storage.getItem(key);
  }

  delete(key: string): void {
    return this.storage.removeItem(key);
  }
}
