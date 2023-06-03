export interface IWordTrainer {
  start(): void;
}

export interface Statistics {
  perfectWordsCount: number;
  errorsCount: number;
  theMostWrongWord: string | undefined;
}

export type HandleChooseLetter = {
  (
    letter: string,
    letterIndex: number,
    successCallback: Function,
    failureCallback: Function
  ): void;
  (letter: string, letterIndex: null): void;
};

export interface Task {
  correctWord: string;
  shuffledLetters: string;
  answer: string;
  errorCount: number;
}

export interface WordTrainerState {
  currentStep: number;
  tasks: Task[];
}
