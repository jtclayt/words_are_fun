import { DataTypes, Model, Optional } from "sequelize";
import { checkWord } from "../helpers/wordHelpers";

import { MSSqlClient } from "../clients/mssql.client";

interface FiveLetterWordAttributes {
  id: number;
  word: string;
}

export interface FiveLetterWordInput extends Optional<FiveLetterWordAttributes, "id"> {};

export class FiveLetterWord extends Model {
  public id!: number;
  public word!: string;

  public static async getRandomWordIdAsync() {
    const totalWords = await FiveLetterWord.count();
    return Math.floor(Math.random() * totalWords);
  }

  public async checkWordAsync(guess: string) {
    return checkWord(guess, this.word);
  }
}

FiveLetterWord.init({
  id: {
    type: DataTypes.SMALLINT,
    autoIncrement: true,
    primaryKey: true
  },
  word: {
    type: DataTypes.CHAR(5),
    allowNull: false,
  }
}, {
  sequelize: MSSqlClient.instance.db,
  timestamps: false,
  modelName: 'FiveLetterWord',
  tableName: "FiveLetterWords"
});
