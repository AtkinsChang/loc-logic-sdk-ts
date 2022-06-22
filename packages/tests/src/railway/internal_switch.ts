import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestRailwayInternalSwitch extends GenericLogic {
  async run() {
    throw Error("my error message");
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.info("on Railway Error");
    this.context.agents.logging.info(`Logic Permanent Identity: ${error.logicPermanentIdentity}`);
    this.context.agents.logging.info(`Logic Revision: ${error.logicRevision}`);
    this.context.agents.logging.info(`Err: ${error.message}`);
  }
}
