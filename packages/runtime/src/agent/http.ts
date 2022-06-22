export class HttpAgent {
  async send(request: Http.Request, config: Http.Config | null): Promise<Http.Response> {
    const { method, url, headers, contentType, body } = request;
    const req = { method, url, headers, contentType, config };

    return Deno.core.opAsync("op_http_agent_send", req, body);
  }

  async get(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null = null,
    config: Http.Config | null = null
  ): Promise<Http.Response> {
    return this.send(new Http.Request(Http.Method.GET, url, headers, contentType, body), config);
  }

  async post(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config: Http.Config | null = null
  ): Promise<Http.Response> {
    return this.send(new Http.Request(Http.Method.POST, url, headers, contentType, body), config);
  }

  async patch(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config: Http.Config | null = null
  ): Promise<Http.Response> {
    return this.send(new Http.Request(Http.Method.PATCH, url, headers, contentType, body), config);
  }

  async put(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config: Http.Config | null = null
  ): Promise<Http.Response> {
    return this.send(new Http.Request(Http.Method.PUT, url, headers, contentType, body), config);
  }

  async delete(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config: Http.Config | null = null
  ): Promise<Http.Response> {
    return this.send(new Http.Request(Http.Method.DELETE, url, headers, contentType, body), config);
  }
}

function urlQueryString(init: any): string {
  let params: [string, string][] = [];

  if (typeof init === "string") {
    if (init[0] === "?") {
      init = init.slice(1);
    }
    return init;
  } else if (Array.isArray(init)) {
    for (const pair of init) {
      // If pair does not contain exactly two items, then throw a TypeError.

      params.push([String(pair[0]), String(pair[1])]);
    }
  } else {
    for (const [key, value] of Object.entries(init)) {
      params.push([String(key), String(value)]);
    }
  }

  return params.map((p) => `${encodeURI(p[0])}=${encodeURI(p[1])}`).join("&");
}

export namespace Http {
  export enum Method {
    GET = "Get",
    POST = "Post",
    PATCH = "Patch",
    PUT = "Put",
    DELETE = "Delete",
  }

  export enum ContentType {
    None = "None",
    PlantText = "PlantText",
    Json = "Json",
    Form = "Form",
  }

  export class Request {
    method: Method;
    url: String;
    headers: Record<string, string>;
    contentType: ContentType;
    body: Uint8Array | null;

    constructor(
      method: Method = Method.GET,
      url: string = "",
      headers: Record<string, string> = {},
      contentType: ContentType = ContentType.None,
      body: Uint8Array | null = null
    ) {
      this.method = method;
      this.url = url;
      this.headers = headers;
      this.contentType = contentType;
      this.body = body;
    }

    setJson(body: any) {
      this.body = Deno.core.encode(JSON.stringify(body));
      this.contentType = ContentType.Json;
      return this;
    }

    setForm(body: any) {
      this.body = Deno.core.encode(urlQueryString(body));
      this.contentType = ContentType.Form;
      return this;
    }
  }

  export class Config {
    acceptInvalidCerts: boolean;

    constructor(acceptInvalidCerts: boolean = false) {
      this.acceptInvalidCerts = acceptInvalidCerts;
    }
  }

  export interface Response {
    status: number;
    headers: Record<string, string>;
    body: Uint8Array;
  }
}
