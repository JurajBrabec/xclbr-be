import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/mailer';
import { MailerHandlers } from '../proto/mailer/Mailer';
import { Params, Params__Output } from '../proto/mailer/Params';
import { Result } from '../proto/mailer/Result';
import { sendEmail } from './email';

const BIND = '0.0.0.0:50051';

const mailerService: MailerHandlers = {
  SendMail: (call: any, callback: any) => {
    let error = false;
    let message: string;
    const { to, subject, body } = call.request as Params;

    if (!to || !subject || !body) {
      error = true;
      message = 'Invalid request';
    } else {
      sendEmail(to, subject, body);
      message = 'Mail sent';
    }
    const result: Result = { error, message };
    callback(error, result);
  },
};
const packageDefinition = protoLoader.loadSync('./mailer.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = grpc.loadPackageDefinition(
  packageDefinition
) as unknown as ProtoGrpcType;

const server = new grpc.Server();
proto.mailer.Mailer.service;
server.addService(proto.mailer.Mailer.service, mailerService);
server.bindAsync(
  BIND,
  grpc.ServerCredentials.createInsecure(),
  (error: Error | null, port: number) => {
    if (error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.log(`Listening on port: ${port}`);
    }
  }
);
