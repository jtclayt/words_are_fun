import { Sequelize } from "sequelize";
import { AZURE_DB_LOGIN_URL, EnvironmentKeys } from "../config/constants";
import { getAADTokenAsync } from "../helpers/getAADTokenAsync";

/**
 * Singleton class for handling DB connection.
 */
export class MSSqlClient {
  public static instance = new MSSqlClient();
  public db : Sequelize;

  /** Ctor@param aadToken Access token for the DB connection. */
  constructor() {
    if (MSSqlClient.instance) {
      throw new Error("MSSqlClient already instantiated");
    }

    MSSqlClient.instance = this;
    const serverName = `${process.env[EnvironmentKeys.DbServerName]}.database.windows.net`;
    this.db = new Sequelize(process.env[EnvironmentKeys.DbName], "", "", {
      dialect: "mssql",
      host: serverName,
      dialectOptions: {
        authentication: {
          type: "azure-active-directory-access-token",
          options: {
            token: ""
          }
        },
        options: {
          encrypt: true
        }
      },
      pool: {
        max: 2,
        min: 0,
        acquire: 20000,
        idle: 12000
      }
    });
    // beforeConnect hook not playing nicely with typescript, make config any as workaround
    this.db.addHook("beforeConnect", async (config: any) => {
      config.dialectOptions.authentication.options.token = await getAADTokenAsync(
        process.env[EnvironmentKeys.AzureClientId],
        process.env[EnvironmentKeys.AzureClientSecret],
        process.env[EnvironmentKeys.AzureTenantId],
        AZURE_DB_LOGIN_URL
      );;
    });
  }
}
