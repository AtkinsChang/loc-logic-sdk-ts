export class ResultAgent {
  finalize(value: object): void {
    Deno.core.opSync("op_result_agent_set", value);
  }
}
