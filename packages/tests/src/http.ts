import { GenericLogic, Logic, Http, RailwayError } from "@saffron/logic";

@Logic()
export class TestHttp extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestHttp");

    await this.testHttpGet();
    await this.testHttpPost();
    await this.testHttpPut();
    await this.testHttpPatch();
    await this.testHttpDelete();
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }

  async testHttpGet() {
    let resp = await this.context.agents.http?.get(
      "http://mock:8080",
      {},
      Http.ContentType.Json
    )!;

    await this.context.agents.sessionStorage.putJson(
      "GET.status",
      resp.status as Number
    );
    await this.context.agents.sessionStorage.putJson(
      "GET.headers",
      resp.headers
    );
    await this.context.agents.sessionStorage.putByteArray(
      "GET.body",
      resp.body
    );
  }

  async testHttpPost() {
    let resp = await this.context.agents.http?.post(
      "http://mock:8080",
      {
        "content-type": "application/json",
      },
      Http.ContentType.Json,
      new Uint8Array([123, 34, 97, 34, 58, 51, 51, 125])
    )!;

    await this.context.agents.sessionStorage.putJson(
      "POST.status",
      resp.status as Number
    );
    await this.context.agents.sessionStorage.putJson(
      "POST.headers",
      resp.headers
    );
    await this.context.agents.sessionStorage.putByteArray(
      "POST.body",
      resp.body
    );
  }

  async testHttpPut() {
    let resp = await this.context.agents.http?.put(
      "http://mock:8080",
      {
        "content-type": "application/json",
      },
      Http.ContentType.Json,
      new Uint8Array([
        123, 34, 100, 97, 116, 97, 49, 34, 58, 34, 112, 117, 116, 32, 109, 111,
        99, 107, 32, 100, 97, 116, 97, 49, 34, 44, 34, 100, 97, 116, 97, 50, 34,
        58, 34, 112, 117, 116, 32, 109, 111, 99, 107, 32, 100, 97, 116, 97, 50,
        34, 125,
      ])
    )!;

    await this.context.agents.sessionStorage.putJson(
      "PUT.status",
      resp.status as Number
    );
    await this.context.agents.sessionStorage.putJson(
      "PUT.headers",
      resp.headers
    );
    await this.context.agents.sessionStorage.putByteArray(
      "PUT.body",
      resp.body
    );
  }

  async testHttpPatch() {
    let resp = await this.context.agents.http?.patch(
      "http://mock:8080",
      {
        "content-type": "application/json",
      },
      Http.ContentType.Json,
      new Uint8Array([
        123, 34, 100, 97, 116, 97, 49, 34, 58, 34, 112, 117, 116, 32, 109, 111,
        99, 107, 32, 100, 97, 116, 97, 49, 34, 125,
      ])
    )!;

    await this.context.agents.sessionStorage.putJson(
      "PATCH.status",
      resp.status as Number
    );
    await this.context.agents.sessionStorage.putJson(
      "PATCH.headers",
      resp.headers
    );
    await this.context.agents.sessionStorage.putByteArray(
      "PATCH.body",
      resp.body
    );
  }

  async testHttpDelete() {
    let resp = await this.context.agents.http?.delete(
      "http://mock:8080",
      {
        "content-type": "application/json",
      },
      Http.ContentType.Json,
      new Uint8Array()
    )!;

    await this.context.agents.sessionStorage.putJson(
      "DELETE.status",
      resp.status as Number
    );
    await this.context.agents.sessionStorage.putJson(
      "DELETE.headers",
      resp.headers
    );
    await this.context.agents.sessionStorage.putByteArray(
      "DELETE.body",
      resp.body
    );
  }
}
