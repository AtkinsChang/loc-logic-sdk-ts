import { Task } from "../primitive";

import { Payload } from "../types/payload";

export abstract class AbstractContext {
  readonly payload: Payload;
  readonly task: Task;

  constructor() {
    this.payload = initializePayload();
    this.task = initializeTask();
  }
}

function initializePayload(): Payload {
  const payload = Deno.core.opSync("op_initialize_payload");
  if ("http" in payload) {
    payload.http.body = Uint8Array.from(atob(payload.http.body), (c) =>
      c.charCodeAt(0)
    );
  }

  if ("messageQueue" in payload) {
    payload.messageQueue.data = Uint8Array.from(
      atob(payload.messageQueue.data),
      (c) => c.charCodeAt(0)
    );
  }

  return payload;
}

function initializeTask(): Task {
  return Deno.core.opSync("op_initialize_task");
}
