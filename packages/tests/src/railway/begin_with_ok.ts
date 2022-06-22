import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestBeginWithOk extends GenericLogic {
  async run() {
    this.context.agents.logging.info("on Railway Ok");
  }

  async handleError(_error: RailwayError) {
    this.context.agents.logging.info("on Railway Error");
  }
}
