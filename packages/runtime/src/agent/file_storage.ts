export class FileStorageAgent {
  // TODO: consider to apply zero-copy buffer
  async simpleGet(url: URL | string): Promise<Uint8Array> {
    return Deno.core.opAsync(
      "op_file_storage_agent_simple_get",
      url instanceof URL ? url.href : url
    );
  }

  async simplePut(
    url: URL | string,
    data: Uint8Array | string,
    options?: FileStorage.PutOptions
  ): Promise<number> {
    const byteArray: Uint8Array =
      typeof data === "string" ? Deno.core.encode(data) : data;

    return Deno.core.opAsync(
      "op_file_storage_agent_simple_put",
      {
        url: url instanceof URL ? url.href : url,
        ensureDir: options?.ensureDir ?? false,
      },
      byteArray
    );
  }

  async delete(url: URL | string): Promise<void> {
    return Deno.core.opAsync(
      "op_file_storage_agent_delete",
      url instanceof URL ? url.href : url
    );
  }

  async list(url: URL | string): Promise<Array<FileStorage.FileType>> {
    return Deno.core.opAsync(
      "op_file_storage_agent_list",
      url instanceof URL ? url.href : url
    );
  }

  async createDirAll(url: URL | string): Promise<void> {
    return Deno.core.opAsync(
      "op_file_storage_agent_create_dir_all",
      url instanceof URL ? url.href : url
    );
  }
}

export namespace FileStorage {
  export interface FileType {
    type: "file" | "directory" | "symbolicLink";
    name: string;
  }

  export interface PutOptions {
    ensureDir?: boolean;
  }
}
