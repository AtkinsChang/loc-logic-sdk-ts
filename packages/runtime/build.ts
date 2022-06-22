import { writeFile, mkdir } from "fs/promises";
import { compileFromFile } from "json-schema-to-typescript";

async function main() {
  await mkdir("src/types", { recursive: true });
  if (process.env["EVENT_JSON_SCHEMA"] !== undefined) {
    const event = await compileFromFile(process.env["EVENT_JSON_SCHEMA"], {
      unreachableDefinitions: true,
    });

    await writeFile("src/types/event.ts", event);
  }

  if (process.env["PAYLOAD_JSON_SCHEMA"] !== undefined) {
    const payload = await compileFromFile(process.env["PAYLOAD_JSON_SCHEMA"], {
      unreachableDefinitions: true,
    });

    await writeFile("src/types/payload.ts", payload);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(87);
});
