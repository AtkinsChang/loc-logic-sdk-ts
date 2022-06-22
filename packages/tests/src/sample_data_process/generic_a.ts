import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class GenericA extends GenericLogic {
  async run() {
    await this.context.agents.sessionStorage.putJson("fstnetwork", 6000 as Number);
    await this.context.agents.sessionStorage.putJson("magic", 9487 as Number);

    await this.context.agents.eventStore.emit([
      {
        labelName: "test-label",
        sourceDigitalIdentity: "my-source-id",
        targetDigitalIdentity: "my-target-id",
        meta: "meta " + 333,
        type: "",
      },
    ]);
  }

  async handleError(_error: RailwayError) {}
}
