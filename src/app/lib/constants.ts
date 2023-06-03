import { Statistics } from "../wordTrainer.interface";

export enum ClassNames {
  Keyboard = "keyboard-row",
  LetterButton = "letter-button",
  AnswerLetter = "answer-letter",
}

export const CACHE_NAME = "WORD_TRAINER";

export const StatisticsDictionary: {
  [K in keyof Statistics]: string;
} = {
  perfectWordsCount: "Число собранных слов без ошибок",
  errorsCount: "Число ошибок",
  theMostWrongWord: "Слово с самым большим числом ошибок",
};
