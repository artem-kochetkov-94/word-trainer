import { IWordShuffler } from "./wordShuffler.interface";

export class WordShuffler implements IWordShuffler {
  public shuffle(word: string): string {
    const letters = word.split("");

    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }

    return letters.join("");
  }
}
