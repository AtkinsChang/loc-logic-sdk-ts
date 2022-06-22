import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestWeb extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestWeb");

    const base64EncodeText = btoa("hello world");
    await this.context.agents.sessionStorage.putByteArray(
      "base64EncodeText",
      Deno.core.encode(base64EncodeText)
    );

    const base64PlantText = atob(base64EncodeText);
    await this.context.agents.sessionStorage.putByteArray(
      "base64PlantText_uint8Array",
      Deno.core.encode(base64PlantText)
    );
    const base64PlantTextString = atob("TWFnaWM=");
    await this.context.agents.sessionStorage.putByteArray(
      "base64PlantText_string",
      Deno.core.encode(base64PlantTextString)
    );

    let uint8array = new TextEncoder().encode("Hi 你好 🐳");
    await this.context.agents.sessionStorage.putByteArray("uint8array", uint8array);

    let string = new TextDecoder().decode(uint8array);
    await this.context.agents.sessionStorage.putString("string", string);

    let blob = new Blob([JSON.stringify({ hello: "world" })], { type: "application/json" });
    await this.context.agents.sessionStorage.putJson("blob_size", blob.size as Number);
    await this.context.agents.sessionStorage.putString("blob_type", blob.type);

    let reader = new FileReader();
    reader.addEventListener("loadend", async () => {
      // reader.result contains the contents of blob as a typed array
      let decoder = new TextDecoder();
      let result = decoder.decode(reader.result);

      await this.context.agents.sessionStorage.putString("fileReader_result", result);
    });
    reader.readAsArrayBuffer(blob);
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
