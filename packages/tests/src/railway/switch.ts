import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestRailwaySwitch extends GenericLogic {
  async run() {
    this.context.agents.logging.info("on Railway Ok");
    throw new URIError("invalid URI");
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.info("on Railway Error");
    this.context.agents.logging.info(`Name: ${error.name}`);
    this.context.agents.logging.info(`Logic Permanent Identity: ${error.logicPermanentIdentity}`);
    this.context.agents.logging.info(`Logic Revision: ${error.logicRevision}`);
    this.context.agents.logging.info(`Err: ${error.message}`);
  }
}
