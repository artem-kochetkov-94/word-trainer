import { ICacheManager, IWordProvider, IWordShuffler } from 'services';
import {
	IWordTrainer,
	Statistics,
	HandleChooseLetter,
	WordTrainerState,
	Task,
	isWordTrainerState,
} from './wordTrainer.interface';
import { IWordRenderer } from './domWordRenderer.interface';
import { removeCharacterAtIndex } from './lib/removeCharacterAtIndex';
import { CACHE_NAME } from './lib/constants';
import { KeyCode } from '../types/keyCode';

export class WordTrainer implements IWordTrainer {
	private state: WordTrainerState;

	constructor(
		private wordProvider: IWordProvider,
		private wordShuffler: IWordShuffler,
		private wordRenderer: IWordRenderer,
		private cacheManager: ICacheManager,
		private options: {
			wordCount: number;
			maxErrors: number;
		},
	) {
		const words = this.wordProvider.getRandomWords(this.options.wordCount);

		this.state = {
			currentStep: 0,
			tasks: words.map(this.createTask),
		};
	}

	private get currentTask() {
		return this.state.tasks[this.state.currentStep];
	}

	private createTask = (word: string): Task => ({
		correctWord: word,
		shuffledLetters: this.wordShuffler.shuffle(word),
		errorCount: 0,
		completed: false,
		completedWithError: false,
		answer: '',
	});

	public start(): void {
		this.checkCache();

		this.wordRenderer.initScene({
			currentStep: this.state.currentStep,
			stepsCount: this.options.wordCount,
			handleChooseLetter: this.handleChooseLetter,
			task: this.currentTask,
		});

		document.addEventListener('keydown', this.handleNavigateScene);
	}

	private checkCache(): void {
		const cache = this.cacheManager.get(CACHE_NAME);

		if (!cache) {
			return;
		}

		const answer = window.confirm('У вас есть не завершенная тренировка, хотите продолжить?');

		if (!answer) {
			return this.cacheManager.delete(CACHE_NAME);
		}

		this.restoreCache(cache);
	}

	private restoreCache(cache: string): void {
		try {
			const restoredData = JSON.parse(cache);

			if (isWordTrainerState(restoredData)) {
				this.state = restoredData;
			} else {
				throw new Error('Invalid cache');
			}
		} catch (e) {
			this.cacheManager.delete(CACHE_NAME);
		}
	}

	private handleChooseLetter: HandleChooseLetter = (
		letter: string,
		letterIndex: number | null,
		successCallback?: VoidFunction,
		failureCallback?: VoidFunction,
	): void => {
		if (letterIndex === null) {
			return this.handleUnknownLetter();
		}

		const { correctWord, answer } = this.currentTask;
		const nextCorrectLetter = correctWord[answer.length];

		if (nextCorrectLetter === letter) {
			this.handleSuccessAction(letter, letterIndex, successCallback);
		} else {
			this.handleFailureAction(failureCallback);
		}
	};

	private handleUnknownLetter() {
		this.handleFailureAction();
	}

	private handleSuccessAction(letter: string, letterIndex: number, cb?: VoidFunction): void {
		this.currentTask.answer += letter;

		this.currentTask.shuffledLetters = removeCharacterAtIndex(
			this.currentTask.shuffledLetters,
			letterIndex,
		);

		cb && cb();
		this.next();
	}

	private handleFailureAction(cb?: VoidFunction): void {
		this.currentTask.errorCount += 1;

		cb && cb();
		this.next();
	}

	private next(): void {
		this.saveCache();

		const { answer, errorCount, correctWord } = this.currentTask;

		if (answer !== correctWord && errorCount < this.options.maxErrors) {
			return;
		}

		this.finishTask();
	}

	private finishTask(): void {
		const { answer, errorCount, correctWord } = this.currentTask;
		this.currentTask.completed = true;

		if (answer === correctWord) {
			this.processTaskBySuccessResult();
		} else if (errorCount === this.options.maxErrors) {
			this.processTaskByFailureResult();
		}
	}

	private processTaskBySuccessResult() {
		if (this.isFinalStep()) {
			this.finishTraining();
			return;
		}

		this.state.currentStep += 1;
		this.saveCache();
		this.nextScene();
	}

	private async processTaskByFailureResult() {
		if (this.isFinalStep()) {
			await this.wordRenderer.handleErrorScene(this.currentTask.correctWord);
			this.finishTraining();
			return;
		}

		await this.wordRenderer.handleErrorScene(this.currentTask.correctWord);

		this.currentTask.completedWithError = true;
		this.state.currentStep += 1;
		this.saveCache();
		this.nextScene();
	}

	private nextScene(): void {
		this.wordRenderer.nextScene({
			currentStep: this.state.currentStep,
			stepsCount: this.options.wordCount,
			task: this.currentTask,
		});
	}

	private isFinalStep(): boolean {
		return this.state.currentStep === this.options.wordCount - 1;
	}

	private saveCache(): void {
		this.cacheManager.set(CACHE_NAME, JSON.stringify(this.state));
	}

	private finishTraining() {
		this.wordRenderer.finishTraining(this.getStatistics());
		this.cacheManager.delete(CACHE_NAME);
		document.removeEventListener('keydown', this.handleNavigateScene);
	}

	private getStatistics(): Statistics {
		const { tasks } = this.state;

		const perfectWordsCount = tasks.filter((task) => task.errorCount === 0).length;

		const errorsCount = tasks.reduce((result, task) => (result += task.errorCount), 0);

		const sortedByErrors = tasks.slice().sort((a, b) => b.errorCount - a.errorCount);

		const theMostWrongWord =
			perfectWordsCount === this.options.wordCount ? undefined : sortedByErrors[0]?.correctWord;

		return {
			perfectWordsCount,
			errorsCount,
			theMostWrongWord,
		};
	}

	private handleNavigateScene = (e: KeyboardEvent): void => {
		if ([KeyCode.ArrowRight, KeyCode.ArrowUp].includes(e.code)) {
			this.handleNavigateNextScene();
		} else if ([KeyCode.ArrowLeft, KeyCode.ArrowDown].includes(e.code)) {
			this.handleNavigatePrevScene();
		}
	};

	private handleNavigateNextScene() {
		if (this.isFinalStep() || !this.currentTask.completed) {
			return;
		}

		this.state.currentStep += 1;
		this.nextScene();
	}

	private handleNavigatePrevScene() {
		if (this.state.currentStep === 0) {
			return;
		}

		this.state.currentStep -= 1;
		this.nextScene();
	}
}
