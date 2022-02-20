import { App } from "../app";
import { FiveLetterWord } from "../models/five-letter-word.model";

export const wordController = () => {
  App.instance.get("/random_word", async (_, res) => {
    const totalWords = await FiveLetterWord.count();
    const randomPk = Math.floor(Math.random() * totalWords)
    const word = await FiveLetterWord.findByPk(randomPk);
    res.send({word: word});
  });
}
