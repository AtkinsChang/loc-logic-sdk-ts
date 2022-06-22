export class LoggingAgent {
  trace(value: string | object) {
    this.log("Trace", value);
  }

  debug(value: string | object) {
    this.log("Debug", value);
  }

  info(value: string | object) {
    this.log("Info", value);
  }

  warn(value: string | object) {
    this.log("Warn", value);
  }

  error(value: string | object) {
    this.log("Error", value);
  }

  log(level: string, value: string | object) {
    let message;

    if (typeof value === "string") {
      message = { String: value };
    } else {
      message = { Json: value };
    }

    let record = { level, message };
    Deno.core.opSync("op_log", record);
  }
}
