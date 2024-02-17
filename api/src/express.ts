import express, { Request, Response } from 'express';
import { Params } from '../../mailer/src/client';

export const getApp = (validator: (params: Params) => boolean) => {
  const app = express();
  app.use(express.json());

  app.post('/api/v1/mail', async (request: Request, response: Response) => {
    try {
      if (!validator(request.body as Params)) {
        return response.status(400).json({ message: 'Invalid request data' });
      }
      return response.status(200).json({ message: 'Mail sent' });
    } catch (error) {
      console.error('Error sending email:', error);
      response.status(500).json({ message: 'Internal server error' });
    }
  });

  return app;
};
