// Original file: mailer.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Params as _mailer_Params, Params__Output as _mailer_Params__Output } from '../mailer/Params';
import type { Result as _mailer_Result, Result__Output as _mailer_Result__Output } from '../mailer/Result';

export interface MailerClient extends grpc.Client {
  SendMail(argument: _mailer_Params, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  SendMail(argument: _mailer_Params, metadata: grpc.Metadata, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  SendMail(argument: _mailer_Params, options: grpc.CallOptions, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  SendMail(argument: _mailer_Params, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  sendMail(argument: _mailer_Params, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  sendMail(argument: _mailer_Params, metadata: grpc.Metadata, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  sendMail(argument: _mailer_Params, options: grpc.CallOptions, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  sendMail(argument: _mailer_Params, callback: grpc.requestCallback<_mailer_Result__Output>): grpc.ClientUnaryCall;
  
}

export interface MailerHandlers extends grpc.UntypedServiceImplementation {
  SendMail: grpc.handleUnaryCall<_mailer_Params__Output, _mailer_Result>;
  
}

export interface MailerDefinition extends grpc.ServiceDefinition {
  SendMail: MethodDefinition<_mailer_Params, _mailer_Result, _mailer_Params__Output, _mailer_Result__Output>
}
