import { WordTrainer } from './app/wordTrainer';
import { DOMWordRenderer } from './app/domWordRenderer';
import { RandomWordProvider, WordShuffler, WordStorage, CacheManager } from './services';
import './styles.css';
import { ClassNames } from './types/classNames';
import '@total-typescript/ts-reset';

const bootstrap = () => {
	const wordStorage = new WordStorage();
	const words = wordStorage.getWords();
	const wordProvider = new RandomWordProvider(words);
	const wordShuffler = new WordShuffler();
	const cacheManager = new CacheManager();

	const answerContainer = document.getElementById(ClassNames.Answers);
	const keyboardContainer = document.getElementById(ClassNames.Keyboard);
	const currentStepContainer = document.getElementById(ClassNames.Current);
	const totalStepsContainer = document.getElementById(ClassNames.Total);
	const statisticsContainer = document.getElementById(ClassNames.Statistics);

	if (
		!answerContainer ||
		!keyboardContainer ||
		!currentStepContainer ||
		!totalStepsContainer ||
		!statisticsContainer
	) {
		alert('Ooops...');
		return;
	}

	const domWordRenderer = new DOMWordRenderer(
		answerContainer,
		keyboardContainer,
		currentStepContainer,
		totalStepsContainer,
		statisticsContainer,
	);

	const wordTrainer = new WordTrainer(wordProvider, wordShuffler, domWordRenderer, cacheManager, {
		wordCount: 2,
		maxErrors: 3,
	});

	wordTrainer.start();
};

bootstrap();
