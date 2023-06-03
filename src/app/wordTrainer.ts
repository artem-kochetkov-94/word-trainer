import { ICacheManager, IWordProvider, IWordShuffler } from "services";
import {
  IWordTrainer,
  Statistics,
  HandleChooseLetter,
  WordTrainerState,
  Task,
} from "./wordTrainer.interface";
import { IWordRenderer } from "./domWordRenderer.interface";
import { removeCharacterAtIndex } from "./lib/removeCharacterAtIndex";
import { CACHE_NAME } from "./lib/constants";

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
    }
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

  private createTask = (word: string): Task => {
    return {
      correctWord: word,
      shuffledLetters: this.wordShuffler.shuffle(word),
      answer: "",
      errorCount: 0,
    };
  };

  public start(): void {
    this.checkCache();

    this.wordRenderer.initScene({
      currentStep: this.state.currentStep + 1,
      stepsCount: this.options.wordCount,
      handleChooseLetter: this.handleChooseLetter,
      task: this.currentTask,
    });
  }

  private checkCache(): void {
    const cache = this.cacheManager.get(CACHE_NAME);

    if (!cache) {
      return;
    }

    const answer = window.confirm(
      "У вас есть не завершенная тренировка, хотите продолжить?"
    );

    if (!answer) {
      return this.cacheManager.delete(CACHE_NAME);
    }

    try {
      let restoredData: WordTrainerState = JSON.parse(cache);
      this.state = restoredData;
    } catch (e) {
      this.cacheManager.delete(CACHE_NAME);
    }
  }

  private handleChooseLetter: HandleChooseLetter = (
    letter: string,
    letterIndex: number | null,
    successCallback?: Function,
    failureCallback?: Function
  ): void => {
    if (letterIndex === null) {
      return this.handleUnknownLetter();
    }

    const nextCorrectLetter =
      this.currentTask.correctWord[this.currentTask.answer.length];

    if (nextCorrectLetter === letter) {
      this.handleSuccessAction(letter, letterIndex, successCallback);
    } else {
      this.handleFailureAction(failureCallback);
    }
  };

  private handleUnknownLetter() {
    this.handleFailureAction();
  }

  private handleSuccessAction(
    letter: string,
    letterIndex: number,
    cb?: Function
  ): void {
    this.currentTask.answer += letter;

    // remove letter from keyabord letters
    this.currentTask.shuffledLetters = removeCharacterAtIndex(
      this.currentTask.shuffledLetters,
      letterIndex
    );

    cb && cb();
    this.next();
  }

  private handleFailureAction(cb?: Function): void {
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

    if (answer === correctWord) {
      this.processedTaskBySuccessResult();
    } else if (errorCount === this.options.maxErrors) {
      this.processedTaskByFailureResult();
    }
  }

  private processedTaskBySuccessResult() {
    if (this.isFinalStep()) {
      this.finishTraining();
      return;
    }

    this.state.currentStep += 1;
    this.cacheManager.set(CACHE_NAME, JSON.stringify(this.state));
    this.nextScene();
  }

  private async processedTaskByFailureResult() {
    if (this.isFinalStep()) {
      await this.wordRenderer.handleErrorScene(this.currentTask.correctWord);
      this.finishTraining();
      return;
    }

    await this.wordRenderer.handleErrorScene(this.currentTask.correctWord);

    this.state.currentStep += 1;
    this.cacheManager.set(CACHE_NAME, JSON.stringify(this.state));
    this.nextScene();
  }

  private nextScene() {
    this.wordRenderer.nextScene({
      currentStep: this.state.currentStep + 1,
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
  }

  private getStatistics(): Statistics {
    const { tasks } = this.state;

    const perfectWordsCount = tasks.filter(
      (task) => task.errorCount === 0
    ).length;

    const errorsCount = tasks.reduce(
      (result, task) => (result += task.errorCount),
      0
    );

    const sortedByErrors = tasks
      .slice()
      .sort((a, b) => b.errorCount - a.errorCount);

    const theMostWrongWord =
      perfectWordsCount === this.options.wordCount
        ? undefined
        : sortedByErrors[0]?.correctWord;

    return {
      perfectWordsCount,
      errorsCount,
      theMostWrongWord,
    };
  }
}
