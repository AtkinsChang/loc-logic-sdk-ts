import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestSessionStorage extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestSessionStorage");

    await this.context.agents.sessionStorage.putString("fstnetwork", "awesome");

    await this.context.agents.sessionStorage.putJson("foo", 1 as Number);

    let bar = Number(await this.context.agents.sessionStorage.get("foo")) + 3;
    await this.context.agents.sessionStorage.putJson("bar", bar as Number);

    const expected = Uint8Array.from([0x94, 0x87, 0x94, 0x87]);
    await this.context.agents.sessionStorage.putByteArray("is87", expected);

    const bytes = (await this.context.agents.sessionStorage.get(
      "is87"
    )) as Uint8Array;
    await this.context.agents.sessionStorage.putJson("is87_check", {
      isUint8Array: bytes instanceof Uint8Array,
      isEqual:
        expected.length == bytes.length &&
        expected.every((element, index) => element === bytes[index]),
    });

    await this.context.agents.sessionStorage.putString(
      "deleteMe",
      "shouldDelete"
    );
    await this.context.agents.sessionStorage.delete("deleteMe");
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
