import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestLogging extends GenericLogic {
  async run() {
    this.context.agents.logging.error("error log");
    this.context.agents.logging.warn("warn log");
    this.context.agents.logging.info("info log");
    this.context.agents.logging.debug("debug log");
    this.context.agents.logging.trace("trace log");

    this.context.agents.logging.info({
      abc: 87,
    });
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
