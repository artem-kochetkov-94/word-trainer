import { HandleChooseLetter } from "./word-trainer.interface";

export interface State {
  answer: string;
  letters: string;
  currentStep: number;
  stepsCount: number;
}

export interface Options extends State {
  handleChooseLetter: HandleChooseLetter;
}
