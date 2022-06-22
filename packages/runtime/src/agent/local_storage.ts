export class LocalStorageAgent {
  async get(key: string): Promise<any> {
    return Deno.core.opAsync("op_local_storage_agent_get", key);
  }

  async putString(key: string, value: string, timeout?: number): Promise<void> {
    await Deno.core.opAsync("op_local_storage_agent_put", {
      key,
      value: { String: value },
      timeout: timeout || null,
    });
  }

  async putByteArray(key: string, value: Uint8Array | string, timeout?: number): Promise<void> {
    const byteArray: Uint8Array = typeof value === "string" ? Deno.core.encode(value) : value;

    await Deno.core.opAsync("op_local_storage_agent_put", {
      key,
      value: { ByteArray: byteArray },
      timeout: timeout || 0,
    });
  }

  async putJson(key: string, value: object, timeout?: number): Promise<void> {
    await Deno.core.opAsync("op_local_storage_agent_put", {
      key,
      value: { Json: value },
      timeout,
    });
  }

  async delete(key: string): Promise<void> {
    await Deno.core.opAsync("op_local_storage_agent_delete", key);
  }

  async remove(key: string): Promise<void> {
    await this.delete(key);
  }
}
