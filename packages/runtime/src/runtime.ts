import { Railway, RailwayError } from "./primitive";

export interface Main {
  (): Promise<void>;
}

export interface ErrorHandler {
  (error: RailwayError): Promise<void>;
}

export async function empty() {}

export class RuntimeError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class Runtime<C> {
  #context: C;
  #run: boolean;
  #main: Main;
  #errorHandler: ErrorHandler;

  constructor(context: C) {
    this.#context = context;
    this.#run = false;
    this.#main = empty;
    this.#errorHandler = empty;
  }

  registerMain(main: Main) {
    if (this.#main !== empty) {
      throw new RuntimeError("main is already registered");
    }
    this.#main = main;
  }

  registerErrorHandler(errorHandler: ErrorHandler) {
    if (this.#errorHandler !== empty) {
      throw new RuntimeError("error handler is already registered");
    }
    this.#errorHandler = errorHandler;
  }

  get context(): C {
    return this.#context;
  }

  async run() {
    if (this.#run) {
      throw new RuntimeError("already executed");
    }

    if (
      this.#main === empty &&
      this.#errorHandler === empty &&
      globalThis.run instanceof Function &&
      globalThis.run.length === 1 &&
      globalThis.handleError instanceof Function &&
      globalThis.handleError.length === 2
    ) {
      this.#main = globalThis.run.bind(null, this.#context);
      this.#errorHandler = globalThis.handleError.bind(null, this.#context);
    }

    if (await Railway.isOk()) {
      try {
        await this.#main();
      } catch (error) {
        Railway.switch(error);
        await this.#errorHandler(await Railway.getError());
      }
    } else {
      await this.#errorHandler(await Railway.getError());
    }
  }
}

declare global {
  export var run: undefined | (<C>(ctx: C) => Promise<void>);
  export var handleError:
    | undefined
    | (<C>(ctx: C, error: RailwayError) => Promise<void>);
}
