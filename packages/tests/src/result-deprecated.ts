import { AggregatorContext, RailwayError } from "@saffron/logic";

Object.assign(globalThis, {
  async run(ctx: AggregatorContext) {
    ctx.agents.result.finalize({
      result: 16 - 9,
    });
  },
  async handleError(ctx: AggregatorContext, error: RailwayError) {
    ctx.agents.logging.error(`${error}`);
  },
});
