import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class EmptyGenericLogic extends GenericLogic {
  async run() {}

  async handleError(_error: RailwayError) {}
}
