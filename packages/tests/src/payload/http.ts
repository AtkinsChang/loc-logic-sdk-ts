import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestHttpPayload extends GenericLogic {
  async run() {
    {
      this.context.agents.logging.info(this.context.task);

      this.context.agents.logging.info("test HttpPayload");
      this.context.agents.logging.info(typeof this.context.payload);
      this.context.agents.logging.info(`${"http" in this.context.payload}`);

      if ("http" in this.context.payload) {
        const {
          apiGatewayIdentityContext,
          apiIdentityContext,
          headers,
          host,
          method,
          path,
          query,
          requestId,
          scheme,
          version,
          body,
        } = this.context.payload.http;

        this.context.agents.logging.info(body.constructor.name);

        this.context.agents.logging.info({
          apiGatewayIdentityContext,
          apiIdentityContext,
          headers,
          host,
          method,
          path,
          query,
          requestId,
          scheme,
          version,
          body: Array.from(body),
        });
      }
    }
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
