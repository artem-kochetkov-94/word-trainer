import { ICacheManager } from "./cache-manager.interface";

export class CacheManager implements ICacheManager {
  private storage = localStorage;

  set(key: string, data: string): void {
    console.log("set");
    this.storage.setItem(key, data);
  }

  get(key: string): string | null {
    console.log("get");
    return this.storage.getItem(key);
  }

  delete(key: string): void {
    console.log("delete");
    return this.storage.removeItem(key);
  }
}
