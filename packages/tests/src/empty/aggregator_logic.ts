import { AggregatorLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class EmptyAggregatorLogic extends AggregatorLogic {
  async run() {}

  async handleError(_error: RailwayError) {}
}
