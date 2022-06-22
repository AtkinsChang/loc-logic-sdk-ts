import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class GenericA extends GenericLogic {
  async run() {
    let i = 0;
    await this.context.agents.sessionStorage.putJson("fstnetwork", i as Number);

    while (true) {
      i++;
    }
  }

  async handleError(_error: RailwayError) {}
}
