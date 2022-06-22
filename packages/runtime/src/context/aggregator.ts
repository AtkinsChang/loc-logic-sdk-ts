import { AbstractContext } from "./context";
import { ResultAgent, LoggingAgent, SessionStorageAgent } from "../agent";

export class AggregatorAgents {
  readonly sessionStorage: SessionStorageAgent;
  readonly logging: LoggingAgent;

  readonly result: ResultAgent;

  constructor() {
    this.sessionStorage = new SessionStorageAgent();
    this.logging = new LoggingAgent();

    this.result = new ResultAgent();
  }
}

export class AggregatorContext extends AbstractContext {
  readonly agents: AggregatorAgents;

  constructor() {
    super();

    this.agents = new AggregatorAgents();
  }
}
