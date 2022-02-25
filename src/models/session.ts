import { randomUUID } from "crypto";
import { DataTypes, Model, Optional } from "sequelize";

import { MSSqlClient } from "../clients/mssql.client";
import { FiveLetterWord } from "./five-letter-word.model";

interface SessionAttributes {
  id: string;
  words: string;
  currentWordId: number;
  currentGuessNumber: number;
  totalWins: number;
  totalGamesPlayed: number;
  firstTryWins: number;
  secondTryWins: number;
  thirdTryWins: number;
  fourthTryWins: number;
  fifthTryWins: number;
  sixthTryWins: number;
  activeWinStreak: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface SessionInput extends Optional<SessionAttributes, "id"> {};

export class Session extends Model {
  public id!: string;
  public words!: string;
  public currentWordId!: number;
  public currentGuessNumber!: number;
  public totalWins!: number;
  public totalGamesPlayed!: number;
  public firstTryWins: number;
  public secondTryWins: number;
  public thirdTryWins: number;
  public fourthTryWins: number;
  public fifthTryWins: number;
  public sixthTryWins: number;
  public activeWinStreak!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;

  /**
   * Generates a new unique UUID
   * @returns the new UUID
   */
  public static async getNewUuidAsync() {
    let newUuid = randomUUID();

    while (await Session.findByPk(newUuid)) {
      newUuid = randomUUID();
    }

    return newUuid;
  }

  /**
   * Takes in a word guess for given session and checks the word.
   * @param guess The word guessed
   * @returns a result array
   */
  public async checkWordAsync(guess: string) {
    const currentWord = await FiveLetterWord.findByPk(this.currentWordId);
    const result = await currentWord.checkWordAsync(guess);
    this.currentGuessNumber += 1;

    if (this.words) {
      this.words += `,${guess}:${result.join("")}`;
    } else {
      this.words = `${guess}:${result.join("")}`;
    }

    const isWin = result.every(letterResult => letterResult === "g");
    const isLoss = this.currentGuessNumber >= 6;
    const word = (isWin || isLoss) ? currentWord.word : "";

    if (isWin) {
      this.updateWinCount();
    } else if (isLoss) {
      this.updateLossCount();
    }

    await this.save();
    return {
      isWin: isWin,
      isGameOver: isWin || isLoss,
      word: word,
      result: result
    };
  }

  /** Resets the game for session. */
  public async resetGameAsync() {
    this.currentGuessNumber = 0;
    this.currentWordId = await FiveLetterWord.getRandomWordIdAsync();
    this.words = "";
    this.save();
  }

  /**
   * Retrieve the current word for session.
   * @returns The current word.
   */
  public async getCurrentWordAsync() {
    return (await FiveLetterWord.findByPk(this.currentWordId)).word;
  }

  /** Handles the logic for updating win counts */
  private updateWinCount() {
    this.totalGamesPlayed += 1;
    this.totalWins += 1;
    this.activeWinStreak += 1;
    console.log(this.totalWins);
    if (this.currentGuessNumber === 1) {
      this.firstTryWins += 1;
    } else if (this.currentGuessNumber === 2) {
      this.secondTryWins += 1;
    } else if (this.currentGuessNumber === 3) {
      this.thirdTryWins += 1;
    } else if (this.currentGuessNumber === 4) {
      this.fourthTryWins += 1;
    } else if (this.currentGuessNumber === 5) {
      this.fifthTryWins += 1;
    } else if (this.currentGuessNumber === 6) {
      this.sixthTryWins += 1;
    }
  }

  /** Handles logic for updating loss counts */
  private updateLossCount() {
    this.totalGamesPlayed += 1;
    this.activeWinStreak = 0;
  }
}

Session.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  words: DataTypes.STRING,
  currentWordId: DataTypes.SMALLINT,
  currentGuessNumber: DataTypes.TINYINT,
  totalWins: DataTypes.INTEGER,
  totalGamesPlayed: DataTypes.INTEGER,
  firstTryWins: DataTypes.INTEGER,
  secondTryWins: DataTypes.INTEGER,
  thirdTryWins: DataTypes.INTEGER,
  fourthTryWins: DataTypes.INTEGER,
  fifthTryWins: DataTypes.INTEGER,
  sixthTryWins: DataTypes.INTEGER,
  activeWinStreak: DataTypes.INTEGER
}, {
  sequelize: MSSqlClient.instance.db,
  timestamps: true,
  paranoid: true,
  modelName: 'Session',
  tableName: "Sessions"
});
