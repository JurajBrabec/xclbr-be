import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/mailer';
import { MailerClient } from '../proto/mailer/Mailer';
import { Params } from '../proto/mailer/Params';
import { Result } from '../proto/mailer/Result';
import { compile } from './pug';

const BIND = '0.0.0.0:50051';
const PROTO = __dirname + '/../mailer.proto';

export const getClient = (
  host: string,
  callback?: () => void
): MailerClient => {
  const packageDefinition = protoLoader.loadSync(PROTO);
  const proto = grpc.loadPackageDefinition(
    packageDefinition
  ) as unknown as ProtoGrpcType;

  const client = new proto.mailer.Mailer(
    host,
    grpc.credentials.createInsecure()
  );

  const deadline = new Date();
  deadline.setSeconds(deadline.getSeconds() + 5);
  client.waitForReady(deadline, (error?: Error) => {
    if (error) {
      console.log(`Client connect error: ${error.message}`);
    } else if (callback) callback();
  });
  return client;
};

export function sendMail(client: MailerClient, params: Params) {
  const body = compile(params);
  client.SendMail(
    { ...params, body },
    (error?: grpc.ServiceError | null, result?: Result) => {
      if (error) {
        console.error(error.message);
      } else if (result) {
        console.log(`Server result: ${result.message}`);
      }
    }
  );
}
function __test(to: string) {
  const client = getClient(BIND, () => {
    const params: Params = {
      to,
      subject: 'MAILER TEST',
      body: 'Hello',
    };
    sendMail(client, params);
  });
}

export { MailerClient, Params, Result };

//__test('juraj@xclbr.com');
