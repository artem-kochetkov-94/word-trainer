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
		successCallback: VoidFunction,
		failureCallback: VoidFunction,
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

export const isWordTrainerState = (data: unknown): data is WordTrainerState => {
	if (
		typeof data === 'object' &&
		!!data &&
		'currentStep' in data &&
		typeof data.currentStep === 'number' &&
		'tasks' in data &&
		Array.isArray(data.tasks)
	) {
		return true;
	}

	return false;
};
