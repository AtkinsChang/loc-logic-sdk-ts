/// <reference path="lib.deno_core.d.ts" />
/// <reference path="lib.deno_url.d.ts" />
/// <reference path="lib.deno_web.d.ts" />
/// <reference types="@saffron/runtime" />

declare global {
  export const Saffron: typeof import("@saffron/runtime");
  export const AggregatorContext: typeof Saffron.AggregatorContext;
  export const GenericContext: typeof Saffron.GenericContext;
}

export { GenericLogic, AggregatorLogic, Context, Logic } from "./index";
export * from "@saffron/runtime";
