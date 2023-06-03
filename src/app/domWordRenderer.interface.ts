import { HandleChooseLetter, Statistics } from "./wordTrainer.interface";

export interface State {
  answer: string;
  keyboardLetters: string;
  currentStep: number;
  stepsCount: number;
}

export interface Options extends State {
  handleChooseLetter: HandleChooseLetter;
}

export abstract class WordRenderer {
  public abstract initScene(options: Options): void;
  public abstract finishTraining(statistics: Statistics): void;
  public abstract nextScene(options: State): void;
  public abstract handleErrorScene(correctWord: string): void;
}

export interface IWordRenderer extends WordRenderer {}