import { WordTrainer } from "./app/word-trainer";
import { DOMWordRenderer } from "./app/dom-word-renderer";
import {
  RandomWordProvider,
  WordShuffler,
  WordStorage,
  CacheManager,
} from "./services";
import "./styles.css";

const main = (): void => {
  const wordStorage = new WordStorage();
  const words = wordStorage.getWords();

  const answerContainer: HTMLElement = document.getElementById("js_answer")!;
  const keyboardContainer: HTMLElement = document.getElementById("js_letters")!;
  const currentStepContainer: HTMLElement = document.getElementById(
    "js_current_question"
  )!;
  const totalStepsCountContainer: HTMLElement =
    document.getElementById("js_total_questions")!;
  const statisticsContainer: HTMLElement =
    document.getElementById("js_statistics")!;
  const domWordRenderer = new DOMWordRenderer(
    answerContainer,
    keyboardContainer,
    currentStepContainer,
    totalStepsCountContainer,
    statisticsContainer
  );

  const wordTrainer = new WordTrainer(
    new RandomWordProvider(words),
    new WordShuffler(),
    domWordRenderer,
    new CacheManager(),
    {
      wordCount: 2,
      maxErrors: 3,
    }
  );
  wordTrainer.start();
};

main();
