import { loginWithServicePrincipalSecret } from "ms-rest-azure";

/**
 * Gets an access token for azure resources.
 * @param clientId App id of client to login
 * @param clientSecret App secret to use to login
 * @param tenantId The tenant that app is under
 * @param loginUrl The specific resource url to use for login
 * @returns The token
 */
export const getAADTokenAsync = (clientId: string, clientSecret: string, tenantId: string, loginUrl: string): Promise<string>  => {
  return new Promise(async (resolve, reject) => {
    const appCredentials = await loginWithServicePrincipalSecret(
      clientId,
      clientSecret,
      tenantId,
      { tokenAudience: loginUrl }
    );

    appCredentials.getToken((err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result.accessToken);
    });
  });
}
