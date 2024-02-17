import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { MailerClient as _mailer_MailerClient, MailerDefinition as _mailer_MailerDefinition } from './mailer/Mailer';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  mailer: {
    Mailer: SubtypeConstructor<typeof grpc.Client, _mailer_MailerClient> & { service: _mailer_MailerDefinition }
    Params: MessageTypeDefinition
    Result: MessageTypeDefinition
  }
}

