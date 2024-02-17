import { Params, getClient, sendMail } from '../../mailer/src/client';
import { getApp } from './express';

const MAILER_ADDR = '0.0.0.0:50051';
const PORT = 3000;

const client = getClient(MAILER_ADDR);

const validateRequest = (params: Params): boolean => {
  if (!params) return false;
  if (!params.to || !params.subject || !params.body) return false;

  sendMail(client, params);
  return true;
};

const app = getApp(validateRequest);
app.listen(PORT, () => console.log('REST API listening on port ' + PORT));
