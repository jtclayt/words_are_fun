import { LetterResult } from "../src/config/constants";
import { checkWord } from "../src/helpers/wordHelpers";

const g = String(LetterResult.Correct);
const y = String(LetterResult.WrongPlace);
const n = String(LetterResult.NotInWord);

test("check word: guess=aaaaa word=about to be gnnnn", () => {
  expect(checkWord("aaaaa", "about").join("")).toBe([g,n,n,n,n].join(""));
});

test("check word: guess=aaaaa word=sassy to be nngnn", () => {
  expect(checkWord("aaaaa", "sassy").join("")).toBe([n,g,n,n,n].join(""));
});

test("check word: guess=aaaaa word=guard to be nngnn", () => {
  expect(checkWord("aaaaa", "guard").join("")).toBe([n,n,g,n,n].join(""));
});

test("check word: guess=aaaaa word=sssat to be nnngn", () => {
  expect(checkWord("aaaaa", "sssat").join("")).toBe([n,n,n,g,n].join(""));
});

test("check word: guess=aaaaa word=ssssa to be nnnng", () => {
  expect(checkWord("aaaaa", "ssssa").join("")).toBe([n,n,n,n,g].join(""));
});

test("check word: guess=smart word=start to be gnggg", () => {
  expect(checkWord("smart", "start").join("")).toBe([g,n,g,g,g].join(""));
});

test("check word: guess=stats word=start to be gggyn", () => {
  expect(checkWord("stats", "start").join("")).toBe([g,g,g,y,n].join(""));
});

test("check word: guess=gsssy word=sassy to be gggyn", () => {
  expect(checkWord("gsssy", "sassy").join("")).toBe([n,y,g,g,g].join(""));
});
