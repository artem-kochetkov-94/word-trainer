import { IWordStorage } from "./word-storage.interface";

export class WordStorage implements IWordStorage {
  private words: string[] = [
    "apple",
    "function",
    "timeout",
    "task",
    "application",
    "data",
    "tragedy",
    "sun",
    "symbol",
    "button",
    "software",
  ];

  public getWords(): string[] {
    return this.words;
  }
}
