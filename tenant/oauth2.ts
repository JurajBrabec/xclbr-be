import axios from 'axios';

export type OAuth2Options = {
  url: string;
  clientID: string;
  clientSecret: string;
};
export type OAuth2Token = string;

export async function getOAuth2Token(
  options: OAuth2Options
): Promise<OAuth2Token> {
  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: options.clientID,
    client_secret: options.clientSecret,
    response_type: 'token',
  });

  try {
    const response = await axios.post(options.url, data);
    return response.data.access_token;
  } catch (error) {
    //    throw new Error('Failed to get access token: ' + error);
    return '';
  }
}
