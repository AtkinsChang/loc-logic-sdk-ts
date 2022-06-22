import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestUrl extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestUrl");

    let baseURL = new URL("https://fst.dev");
    await this.context.agents.sessionStorage.putString("baseURL_href", baseURL.href);

    let withPath = new URL("/fst-quick-start/", baseURL);
    await this.context.agents.sessionStorage.putString("withPath_href", withPath.href);
    await this.context.agents.sessionStorage.putString("withPath_protocol", withPath.protocol);
    await this.context.agents.sessionStorage.putString("withPath_host", withPath.host);

    let searchParams = new URLSearchParams("a=Apple&b=Banana");
    await this.context.agents.sessionStorage.putString(
      "searchParams_a",
      searchParams.get("a") as string
    );
    searchParams.append("c", "California");
    await this.context.agents.sessionStorage.putString(
      "searchParams_c",
      searchParams.get("c") as string
    );
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
