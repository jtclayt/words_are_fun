import { LetterResult } from "../config/constants";

/**
 * Takes a look at a word, does some random stuff.
 * @param guess Word guessed
 * @param word Actual word
 * @returns Results array for each letter
 */
export const checkWord = (guess: string, word: string): string[] => {
  const result: string[] = [
    LetterResult.NotInWord,
    LetterResult.NotInWord,
    LetterResult.NotInWord,
    LetterResult.NotInWord,
    LetterResult.NotInWord
  ];
  const guessArr = guess.split("");
  const wordLetterCounts = getLetterCounts(word);

  // First check the correct spots
  guessArr.forEach((letter, index) => {
    if (letter === word[index]) {
      guessArr[index] = "";
      wordLetterCounts.set(letter, wordLetterCounts.get(letter)-1);
      result[index] = LetterResult.Correct;
    }
  });

  // Now check if there are any letters that could still be match but are in wrong place
  guessArr.forEach((letter, index) => {
    if (letter && wordLetterCounts.has(letter) && wordLetterCounts.get(letter) > 0) {
      wordLetterCounts.set(letter, wordLetterCounts.get(letter)-1);
      result[index] = LetterResult.WrongPlace;
    }
  });

  return result;
};

/**
 * Gets a map containing letter counts in a word.
 * @param word The word (bird)
 * @returns The map
 */
export const getLetterCounts = (word: string): Map<string, number> => {
  const letterCounts = new Map<string, number>();
  word
    .split("")
    .forEach(letter => {
      if (letterCounts.has(letter)) {
        letterCounts.set(letter, letterCounts.get(letter) + 1);
      }
      else {
        letterCounts.set(letter, 1);
      }
    });

  return letterCounts;
};
