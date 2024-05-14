import axios from 'axios';
import { Agent } from 'node:https';

const instance = axios.create({
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
});

export type OAuth2Options = {
  url: string;
  clientID: string;
  clientSecret: string;
};

export async function getOAuth2Token(options: OAuth2Options): Promise<string> {
  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: options.clientID,
    client_secret: options.clientSecret,
    response_type: 'token',
  });
  const response = await instance.post(options.url, data);
  console.log(response.data);
  return response.data.access_token;
}
