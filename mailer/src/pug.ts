import * as pug from 'pug';
import { Params } from './client';

const TEMPLATE = __dirname + '/../templates/mailer.pug';

export const compile = (params: Params) => {
  const render = pug.compileFile(TEMPLATE);
  return render(params);
};
