import { ClassNames } from "./lib/constants";
import { State, Options } from "./dom-word-renderer.interface";
import { HandleChooseLetter, Statistics } from "./word-trainer.interface";
import { getChildIndex } from "./lib/getChildIndex";
import { KeyCode } from "../types/keyCode";

export abstract class WordRenderer {
  public abstract initScene(options: Options): void;
  public abstract finishTraining(statistics: Statistics): void;
}

export interface IWordRenderer extends WordRenderer {}

export class DOMWordRenderer implements IWordRenderer {
  private handleChooseLetter: HandleChooseLetter;
  private state: State;

  private isAnimationProcessed = false;

  constructor(
    private answerContainer: HTMLElement,
    private keyboardContainer: HTMLElement,
    private currentStepContainer: HTMLElement,
    private totalStepsCountContainer: HTMLElement,
    private statisticsContainer: HTMLElement
  ) {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  public initScene({ handleChooseLetter, ...options }: Options): void {
    this.initState(options);

    this.handleChooseLetter = handleChooseLetter;

    this.clearScene();
    this.renderHeader();
    this.renderAnswer();
    this.renderKeyboard();
  }

  private initState(options: State): void {
    this.state = options;
  }

  private clearScene(): void {
    this.answerContainer.innerHTML = "";
    this.keyboardContainer.innerHTML = "";
  }

  private renderHeader(): void {
    this.currentStepContainer.innerHTML = String(this.state.currentStep);
    this.totalStepsCountContainer.innerHTML = String(this.state.stepsCount);
  }

  private renderAnswer(): void {
    this.state.answer.split("").forEach((letter) => {
      this.addAnswerLetterElementToContainer(letter);
    });
  }

  private renderKeyboard(): void {
    this.keyboardContainer.appendChild(this.createKeyboardContainer());
  }

  private createKeyboardContainer(): HTMLDivElement {
    const keyboardRow = document.createElement("div");
    keyboardRow.classList.add(ClassNames.Keyboard);
    keyboardRow.addEventListener("click", (e) => this.hadleKeyboardClick(e));

    for (let i = 0; i < this.state.letters.length; i++) {
      const button = this.createLetterButtonElement(this.state.letters[i]);
      keyboardRow.appendChild(button);
    }

    return keyboardRow;
  }

  private createLetterButtonElement(letter: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add(ClassNames.AnswerLetter);
    button.textContent = letter;

    return button;
  }

  private addAnswerLetterElementToContainer(letter: string) {
    const letterEl = document.createElement("div");
    letterEl.classList.add(ClassNames.AnswerLetter);
    letterEl.textContent = letter;

    this.answerContainer.appendChild(letterEl);
  }

  private hadleKeyboardClick(e: MouseEvent): void {
    const target = e.target as HTMLButtonElement;

    if (!target.classList.contains("letter-button")) {
      return;
    }

    this.handleChooseLetter(
      target.textContent!,
      getChildIndex(target),
      () => this.handlePickLetterSuccess(target),
      () => this.handlePickLetterFailure(target)
    );
  }

  private handlePickLetterSuccess(target: HTMLButtonElement): void {
    target.remove();
    this.addAnswerLetterElementToContainer(target.textContent!);
  }

  private handlePickLetterFailure(target: HTMLButtonElement) {
    if (this.isAnimationProcessed) {
      return;
    }

    target.classList.add("error");
    this.isAnimationProcessed = true;

    setTimeout(() => {
      target.classList.remove("error");
      this.isAnimationProcessed = false;
    }, 1000);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    if (
      e.shiftKey ||
      [KeyCode.Tab, KeyCode.CapsLock].includes(e.code as KeyCode)
    ) {
      e.preventDefault();
      return;
    }

    const buttons = Array.from(
      this.keyboardContainer.querySelectorAll(`.${ClassNames.AnswerLetter}`)
    );
    const firstButtonWithLetter = buttons.find((button) => {
      return button.textContent === key;
    }) as HTMLButtonElement | undefined;

    if (!firstButtonWithLetter) {
      return this.handleChooseLetter(key, null);
    }

    this.handleChooseLetter(
      key,
      getChildIndex(firstButtonWithLetter),
      () => this.handlePickLetterSuccess(firstButtonWithLetter),
      () => this.handlePickLetterFailure(firstButtonWithLetter)
    );
  }

  public finishTraining(statistics: Statistics): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.showStatistics(statistics);
  }

  private showStatistics(statistics: Statistics): void {
    const ul = document.createElement("ul");
    const fragment = new DocumentFragment();

    const items = {
      perfectWordsCount: {
        title: "Число собранных слов без ошибок",
        value: statistics.perfectWordsCount,
      },
      errorsCount: {
        title: "Число ошибок",
        value: statistics.errorsCount,
      },
      theMostWrongWord: {
        title: "Слово с самым большим числом ошибок",
        value: statistics.theMostWrongWord,
      },
    };

    Object.values(items).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.title}: ${item.value}`;
      fragment.append(li);
    });

    ul.append(fragment);

    this.clearScene();
    this.statisticsContainer.appendChild(ul);
  }
}
