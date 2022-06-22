export class SessionStorageAgent {
  async get(key: string): Promise<string | number | object | Uint8Array> {
    return Deno.core.opAsync("op_session_storage_agent_get", key);
  }

  async putJson(key: string, value: any): Promise<boolean> {
    return Deno.core.opAsync("op_session_storage_agent_put", {
      key,
      value: { Json: value },
    });
  }

  async putString(key: string, value: string): Promise<boolean> {
    return Deno.core.opAsync("op_session_storage_agent_put", {
      key,
      value: { String: value },
    });
  }

  async putByteArray(key: string, value: Uint8Array | string): Promise<boolean> {
    const byteArray: Uint8Array = typeof value === "string" ? Deno.core.encode(value) : value;

    return Deno.core.opAsync("op_session_storage_agent_put", {
      key,
      value: { ByteArray: byteArray },
    });
  }

  async delete(key: string): Promise<void> {
    await Deno.core.opAsync("op_session_storage_agent_delete", key);
  }

  async remove(key: string): Promise<void> {
    await this.delete(key);
  }
}
