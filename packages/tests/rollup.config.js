import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

function testCase(path) {
  return defineConfig({
    input: `src/${path}.ts`,
    output: {
      name: "Logic",
      file: `target/${path}.js`,
      format: "iife",
      sourcemap: "inline",
      globals: {
        "@saffron/runtime": "Saffron",
      },
    },
    plugins: [resolve(), typescript({ tsconfig: "./tsconfig.json" })],
    external: ["@saffron/runtime"],
  });
}

export default defineConfig([
  testCase("database"),
  testCase("deno_extension/url"),
  testCase("deno_extension/web"),
  testCase("empty/aggregator_logic"),
  testCase("empty/generic_logic"),
  testCase("event"),
  testCase("file_storage"),
  testCase("http"),
  testCase("local_storage"),
  testCase("logging"),
  testCase("payload/event"),
  testCase("payload/http"),
  testCase("payload/message_queue"),
  testCase("railway/begin_with_error"),
  testCase("railway/begin_with_ok"),
  testCase("railway/internal_switch"),
  testCase("railway/switch"),
  testCase("result"),
  testCase("result-deprecated"),
  testCase("sample_data_process/aggregator"),
  testCase("sample_data_process/generic_a"),
  testCase("sample_data_process/generic_b"),
  testCase("timeout_data_process/aggregator"),
  testCase("timeout_data_process/generic_a"),
  testCase("session_storage"),
  testCase("smtp"),
]);
