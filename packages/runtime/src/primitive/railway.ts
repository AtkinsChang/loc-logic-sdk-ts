export class Railway {
  static async isOk(): Promise<boolean> {
    return Deno.core.opAsync("op_railway_is_ok");
  }

  static async switch(err: any): Promise<void> {
    if (err instanceof Error) {
      let { name, message } = err;
      await Deno.core.opAsync("op_railway_switch", { name, message });
    } else if (typeof err === "string") {
      await Deno.core.opAsync("op_railway_switch", {
        name: "CustomError",
        message: err,
      });
    } else {
      await Deno.core.opAsync("op_railway_switch", {
        name: "CustomError",
        message: `${err}`,
      });
    }
  }

  static async getError(): Promise<RailwayError> {
    let { name, message, logicPermanentIdentity, logicRevision } =
      await Deno.core.opAsync("op_railway_get_error");
    return new RailwayError(
      name,
      message,
      logicPermanentIdentity,
      logicRevision
    );
  }
}

export class RailwayError extends Error {
  logicPermanentIdentity: string;
  logicRevision: number;

  constructor(
    name: string,
    message: string,
    logicPermanentIdentity: string,
    logicRevision: number
  ) {
    super(message);
    this.name = name;
    this.logicPermanentIdentity = logicPermanentIdentity;
    this.logicRevision = logicRevision;
  }
}
