import { AggregatorContext, GenericContext } from "./context";
import { Runtime } from "./runtime";

export { Smtp, Http, Database } from "./agent";
export type {
  DatabaseAgent,
  EventAgent,
  FileStorageAgent,
  HttpAgent,
  LocalStorageAgent,
  LoggingAgent,
  ResultAgent,
  SessionStorageAgent,
  SmtpAgent,
  SmtpAgentHub,
} from "./agent";
export type { AggregatorContext, GenericContext } from "./context";
export type { Railway, RailwayError, Task } from "./primitive";
export type { IdentityContext } from "./types/event";
export type {
  DataSourceIdentityContext,
  EventPayload,
  HttpPayload,
  MessageQueuePayload,
  Payload,
} from "./types/payload";

Object.assign(globalThis, {
  AggregatorContext,
  GenericContext,
});

export let runtime: Runtime<AggregatorContext | GenericContext>;

export function genericLogic() {
  const context = new GenericContext();
  runtime = new Runtime(context);
}

export function aggregatorLogic() {
  const context = new AggregatorContext();
  runtime = new Runtime(context);
}
