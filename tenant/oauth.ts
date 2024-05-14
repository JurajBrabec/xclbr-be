import axios from 'axios';
import { Agent } from 'node:https';

const instance = axios.create({
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
});

export type OAuthOptions = {
  url: string;
  clientID: string;
  clientSecret: string;
};

export async function getOAuthToken(options: OAuthOptions): Promise<string> {
  const headers = {
    Authorization: `Basic ${options.clientSecret}`,
  };
  const response = await instance.request({
    headers,
    maxRedirects: 0,
    method: 'GET',
    validateStatus: function (status: number): boolean {
      return status >= 200 && status <= 302;
    },
    url: `${options.url}/oauth/authorize?response_type=token&client_id=${options.clientID}`,
  });
  const location = response.headers['location'];
  const token = location.split('=')[1].split('&')[0];
  return token;
}
