import { IWordProvider } from './wordProvider.interface';

export class RandomWordProvider implements IWordProvider {
	constructor(private words: string[]) {}

	public getRandomWords(count: number): string[] {
		const randomWords: string[] = [];

		while (randomWords.length < count) {
			const randomIndex = Math.floor(Math.random() * this.words.length);
			const word = this.words[randomIndex];
			if (!randomWords.includes(word)) {
				randomWords.push(word);
			}
		}

		return randomWords;
	}
}
