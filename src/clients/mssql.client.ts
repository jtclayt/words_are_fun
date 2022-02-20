import { Sequelize } from "sequelize";
import { AZURE_DB_LOGIN_URL, EnvironmentKeys } from "../config/constants";
import { getAADTokenAsync } from "../helpers/get-aad-token";

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
      const token = await this.getAADToken();
      config.dialectOptions.authentication.options.token = token;
    });
  }

  /**
   * Helper method for retrieving service principal token for DB.
   * @returns The token for connecting.
   */
  private async getAADToken(): Promise<string> {
    return await getAADTokenAsync(
      process.env[EnvironmentKeys.AzureClientId],
      process.env[EnvironmentKeys.AzureClientSecret],
      process.env[EnvironmentKeys.AzureTenantId],
      AZURE_DB_LOGIN_URL
    );
  }
}
