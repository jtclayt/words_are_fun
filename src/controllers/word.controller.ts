import { checkWord } from "../helpers/wordHelpers";
import { App } from "../app";
import { FiveLetterWord } from "../models/five-letter-word.model";

export const wordController = () => {
  App.instance.get("/new_word", async (_, res) => {
    const totalWords = await FiveLetterWord.count();
    const randomPk = Math.floor(Math.random() * totalWords);
    res.send({wordId: randomPk});
  });

  App.instance.post("/check_word", async (req, res) => {
    const wordId = Number(req.body.wordId);
    const guess = String(req.body.guess);
    const word = (await FiveLetterWord.findByPk(wordId)).word;
    const result = checkWord(guess, word);

    res.send({result: result})
  });
}
