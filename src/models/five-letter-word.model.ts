import { DataTypes, Model, Optional } from "sequelize";

import { MSSqlClient } from "../clients/mssql.client";

interface FiveLetterWordAttributes {
  id: number;
  word: string
}

export interface FiveLetterWordInput extends Optional<FiveLetterWordAttributes, "id"> {};

export class FiveLetterWord extends Model {
  public id!: number;
  public word!: string;
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
