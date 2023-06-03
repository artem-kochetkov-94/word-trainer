import { ClassNames, StatisticsDictionary } from "./lib/constants";
import { State, Options, IWordRenderer } from "./domWordRenderer.interface";
import { HandleChooseLetter, Statistics } from "./wordTrainer.interface";
import { getChildIndex } from "./lib/getChildIndex";
import { KeyCode } from "../types/keyCode";

export class DOMWordRenderer implements IWordRenderer {
  private handleChooseLetter: HandleChooseLetter;
  private state: State;
  private isAnimationProcessed = false;

  constructor(
    private answerContainer: HTMLElement,
    private keyboardContainer: HTMLElement,
    private currentStepContainer: HTMLElement,
    private totalStepsContainer: HTMLElement,
    private statisticsContainer: HTMLElement
  ) {}

  public initScene({ handleChooseLetter, ...options }: Options): void {
    this.initState(options);
    this.handleChooseLetter = handleChooseLetter;

    this.renderScene();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  public nextScene(options: State): void {
    this.initState(options);
    this.renderScene();
  }

  public async handleErrorScene(correctWord: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.answerContainer.classList.add("error");
      document.removeEventListener("keydown", this.handleKeyDown);

      this.keyboardContainer.innerHTML = "";
      const restLetters = correctWord.slice(this.state.answer.length);
      restLetters.split("").forEach((letter) => {
        this.addAnswerLetterElementToContainer(letter);
      });

      setTimeout(() => {
        this.answerContainer.classList.remove("error");
        document.addEventListener("keydown", this.handleKeyDown);
        resolve();
      }, 1500);
    });
  }

  private renderScene() {
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
    this.totalStepsContainer.innerHTML = String(this.state.stepsCount);
  }

  private renderAnswer(): void {
    this.state.answer.split("").forEach((letter) => {
      this.addAnswerLetterElementToContainer(letter);
    });
  }

  private addAnswerLetterElementToContainer(letter: string) {
    const letterEl = document.createElement("div");
    letterEl.classList.add(ClassNames.AnswerLetter);
    letterEl.textContent = letter;

    this.answerContainer.appendChild(letterEl);
  }

  private renderKeyboard(): void {
    this.keyboardContainer.appendChild(this.createKeyboardContainer());
  }

  private createKeyboardContainer(): HTMLDivElement {
    const keyboardRow = document.createElement("div");
    keyboardRow.classList.add(ClassNames.Keyboard);
    keyboardRow.addEventListener("click", this.hadleKeyboardClick);

    for (let i = 0; i < this.state.keyboardLetters.length; i++) {
      const button = this.createLetterButtonElement(
        this.state.keyboardLetters[i]
      );
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
    }, 200);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (
      e.shiftKey ||
      [KeyCode.Tab, KeyCode.CapsLock].includes(e.code as KeyCode)
    ) {
      e.preventDefault();
      return;
    }

    const firstButtonWithLetter = this.findButtonByLetter(e.key);

    if (!firstButtonWithLetter) {
      return this.handleChooseLetter(e.key, null);
    }

    this.handleChooseLetter(
      e.key,
      getChildIndex(firstButtonWithLetter),
      () => this.handlePickLetterSuccess(firstButtonWithLetter),
      () => this.handlePickLetterFailure(firstButtonWithLetter)
    );
  };

  private findButtonByLetter(letter: string): HTMLButtonElement | undefined {
    const buttons = Array.from(
      this.keyboardContainer.querySelectorAll(`.${ClassNames.AnswerLetter}`)
    );
    const firstButtonWithLetter = buttons.find((button) => {
      return button.textContent === letter;
    }) as HTMLButtonElement | undefined;

    return firstButtonWithLetter;
  }

  public finishTraining(statistics: Statistics): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.showStatistics(statistics);
  }

  private showStatistics(statistics: Statistics): void {
    const ul = document.createElement("ul");
    const fragment = new DocumentFragment();

    let key: keyof typeof statistics;
    for (key in statistics) {
      const li = document.createElement("li");
      li.textContent = `${StatisticsDictionary[key]}: ${
        statistics[key] || "-"
      }`;
      fragment.append(li);
    }

    ul.append(fragment);

    this.clearScene();
    this.statisticsContainer.appendChild(ul);
  }
}