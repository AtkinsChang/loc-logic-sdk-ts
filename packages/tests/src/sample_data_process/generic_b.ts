import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class GenericB extends GenericLogic {
  async run() {
    let value = (await this.context.agents.sessionStorage.get("fstnetwork")) as Number;
    await this.context.agents.sessionStorage.putJson("kuma", (Number(value) + 6000) as Number);
  }

  async handleError(_error: RailwayError) {}
}
