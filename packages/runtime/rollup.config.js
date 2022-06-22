import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      name: "Saffron",
      file: "target/index.js",
      format: "umd",
      sourcemap: "inline",
    },
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
  },
  {
    input: "target/dts/index.d.ts",
    output: {
      file: "target/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
]);
