import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestEventPayload extends GenericLogic {
  async run() {
    this.context.agents.logging.info(this.context.task);

    this.context.agents.logging.info("test EventPayload");
    this.context.agents.logging.info(typeof this.context.payload);
    this.context.agents.logging.info(`${"event" in this.context.payload}`);
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
