import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestRailwayBeginWithError extends GenericLogic {
  async run() {
    this.context.agents.logging.info("on Railway Ok");
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.info("on Railway Error");
    this.context.agents.logging.info(`Logic Permanent Identity: ${error.logicPermanentIdentity}`);
    this.context.agents.logging.info(`Logic Revision: ${error.logicRevision}`);
    this.context.agents.logging.info(`Err: ${error.message}`);
  }
}
