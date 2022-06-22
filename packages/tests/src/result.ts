import { AggregatorLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestResult extends AggregatorLogic {
  async run() {
    this.context.agents.result.finalize({
      fstnetwork: "awesome",
      magicNumber: 9487,
      result2: null,
      error: null,
    });
  }

  async handleError(_error: RailwayError) {}
}
