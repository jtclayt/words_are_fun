import { App } from "../app";
import { FiveLetterWord } from "../models/five-letter-word.model";
import { Session, SessionInput } from "../models/session";

export const sessionController = () => {
  // Endpoint for creating a new session
  App.instance.post("/sessions", async (_, res) => {
    const newSessionId = await Session.getNewUuidAsync();

    const newSessionInput: SessionInput = {
      id: newSessionId,
      words: "",
      currentWordId: await FiveLetterWord.getRandomWordIdAsync(),
      currentGuessNumber: 0,
      totalWins: 0,
      totalGamesPlayed: 0,
      firstTryWins: 0,
      secondTryWins: 0,
      thirdTryWins: 0,
      fourthTryWins: 0,
      fifthTryWins: 0,
      sixthTryWins: 0,
      activeWinStreak: 0
    };
    await Session.create(newSessionInput);

    res.send({sessionId: newSessionId});
  });

  // Endpoint for retrieving a session
  App.instance.get("/sessions/:sessionId", async (req, res) => {
    const sessionId = String(req.params.sessionId);
    const currentSession = await Session.findByPk(sessionId);
    if (currentSession === null) {
      res.status(404).send({message: "Session not found"});
    } else {
      res.send({guesses: currentSession.words});
    }
  });

  // Endpoint for checking a word
  App.instance.post("/sessions/:sessionId", async (req, res) => {
    const sessionId = String(req.params.sessionId);
    const guess = String(req.body.guess);
    const currentSession = await Session.findByPk(sessionId);

    if (currentSession.currentGuessNumber >= 6) {
      await currentSession.resetGameAsync();
      res.status(400).send({message: "Max guesses reached, resetting word"})
    } else {
      const result = await currentSession.checkWordAsync(guess);
      res.send(result);
    }
  });

  // Endpoint for resetting for a new word
  App.instance.post("/sessions/:sessionId/reset", async (req, res) => {
    const sessionId = String(req.params.sessionId);
    const currentSession = await Session.findByPk(sessionId);

    if (currentSession) {
      await currentSession.resetGameAsync();
    }

    res.send({reset: currentSession !== null});
  });
}
