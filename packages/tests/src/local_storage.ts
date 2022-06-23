import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestLocalStorage extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestLocalStorage");

    // test putString by string
    await this.context.agents.localStorage?.putString("fstnetwork", "awesome");

    // test putByteArray by byte array
    let arr = Deno.core.encode("bar");
    await this.context.agents.localStorage?.putByteArray("fst", arr);

    // test putByteArray by Uint8Array
    await this.context.agents.localStorage?.putByteArray(
      "kawa",
      new Uint8Array([121, 111])
    );

    // test putByteArray by string
    await this.context.agents.localStorage?.putByteArray(
      "byteArrayByString",
      "fromStr"
    );

    await this.context.agents.localStorage?.putJson("foo", 1 as Number);
    let bar = (await this.context.agents.localStorage?.get("foo")) + 3;
    await this.context.agents.localStorage?.putJson("bar", bar);
    await this.context.agents.localStorage?.putJson("baz", { baz: 777 });

    await this.context.agents.localStorage?.putString(
      "deleteMe",
      "shouldDelete"
    );
    await this.context.agents.localStorage?.delete("deleteMe");

    const expected = Uint8Array.from([0x94, 0x87, 0x94, 0x87]);
    await this.context.agents.localStorage?.putByteArray("is87", expected);

    const bytes = (await this.context.agents.localStorage?.get(
      "is87"
    )) as Uint8Array;
    await this.context.agents.localStorage?.putJson("is87_check", {
      isUint8Array: bytes instanceof Uint8Array,
      isEqual:
        expected.length == bytes.length &&
        expected.every((element, index) => element === bytes[index]),
    });
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
