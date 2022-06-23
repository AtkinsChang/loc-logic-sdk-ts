import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestMessageQueuePayload extends GenericLogic {
  async run() {
    {
      this.context.agents.logging.info(this.context.task);

      this.context.agents.logging.info("test MessageQueuePayload");
      this.context.agents.logging.info(typeof this.context.payload);
      this.context.agents.logging.info(
        `${"messageQueue" in this.context.payload}`
      );

      if ("messageQueue" in this.context.payload) {
        const { clientIdentityContext, subscriber, data } =
          this.context.payload.messageQueue;

        this.context.agents.logging.info(data.constructor.name);

        this.context.agents.logging.info({
          clientIdentityContext,
          subscriber,
          data: Array.from(data),
        });
      }
    }
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
