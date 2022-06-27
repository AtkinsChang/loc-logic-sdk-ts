(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Saffron = {}));
}(this, (function (exports) { 'use strict';

  class AbstractContext {
    payload;
    task;
    constructor() {
      this.payload = initializePayload();
      this.task = initializeTask();
    }
  }
  function initializePayload() {
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
  function initializeTask() {
    return Deno.core.opSync("op_initialize_task");
  }

  class DatabaseAgent {
    async connect({
      databaseDriver,
      connectionString = null,
      connection = null,
    }) {
      let connectionParameters;
      if (typeof connectionString === "string") {
        connectionParameters = { plainConnectionString: connectionString };
      } else {
        if (typeof connection === "string") {
          connectionParameters = { plainConnectionString: connection };
        } else if (connection instanceof exports.Database.MssqlParameters) {
          connectionParameters = { mssql: connection };
        } else if (connection instanceof exports.Database.MySqlParameters) {
          connectionParameters = { mySql: connection };
        } else if (connection instanceof exports.Database.OracleParameters) {
          connectionParameters = { oracle: connection };
        } else if (connection instanceof exports.Database.PostgresParameters) {
          connectionParameters = { postgres: connection };
        } else {
          throw new TypeError("missing connection information");
        }
      }
      let uid = await Deno.core.opAsync("op_database_agent_connect", {
        databaseDriver,
        connection: connectionParameters,
      });
      return new DatabaseClient(uid);
    }
  }
  class DatabaseClient {
    uid;
    constructor(uid) {
      this.uid = uid;
    }
    async query(rawSql, params) {
      let results = await Deno.core.opAsync("op_database_agent_query", {
        uid: this.uid,
        rawSql,
        params,
      });
      results.rows = results.rows.reduce((newRows, row) => {
        let newRow = {};
        for (let i = 0; i < results.columns.length; i++) {
          const columnName = results?.columns[i]?.name;
          if (columnName !== undefined) {
            newRow[columnName] = Object.values(row[i])[0];
          }
        }
        newRows.push(newRow);
        return newRows;
      }, []);
      return results;
    }
    async disconnect() {
      await Deno.core.opAsync("op_database_agent_disconnect", this.uid);
    }
    async execute(rawSql, params) {
      return Deno.core.opAsync("op_database_agent_execute", {
        uid: this.uid,
        rawSql,
        params,
      });
    }
    async beginTransaction() {
      await Deno.core.opAsync("op_database_agent_begin_transaction", this.uid);
      return this;
    }
    async commitTransaction() {
      await Deno.core.opAsync("op_database_agent_commit_transaction", this.uid);
    }
    async rollbackTransaction() {
      await Deno.core.opAsync("op_database_agent_rollback_transaction", this.uid);
    }
  }
  exports.Database = void 0;
  (function (Database) {
    (function (Driver) {
      Driver["Postgres"] = "Postgres";
      Driver["MySql"] = "MySQL";
      Driver["Mssql"] = "MSSQL";
      Driver["Db2"] = "Db2";
      Driver["Oracle"] = "Oracle";
      Driver["Snowflake"] = "Snowflake";
    })((Database.Driver || (Database.Driver = {})));
    class MssqlParameters {
      host;
      port;
      database;
      username;
      password;
      trustCert;
      instanceName;
      constructor(parameters) {
        this.host = parameters?.host ?? "localhost";
        this.port = parameters?.port ?? 1433;
        this.database = parameters?.database ?? "";
        this.username = parameters?.username ?? "";
        this.password = parameters?.password ?? "";
        this.trustCert = parameters?.trustCert;
        this.instanceName = parameters?.instanceName;
      }
    }
    Database.MssqlParameters = MssqlParameters;
    class MySqlParameters {
      host;
      port;
      database;
      username;
      password;
      constructor(parameters) {
        this.host = parameters?.host ?? "localhost";
        this.port = parameters?.port ?? 3306;
        this.database = parameters?.database ?? "";
        this.username = parameters?.username ?? "";
        this.password = parameters?.password ?? "";
      }
    }
    Database.MySqlParameters = MySqlParameters;
    class OracleParameters {
      host;
      port;
      serviceName;
      username;
      password;
      integratedSecurity;
      extraParams;
      constructor(parameters) {
        this.host = parameters?.host ?? "localhost";
        this.port = parameters?.port ?? 1521;
        this.serviceName = parameters?.serviceName ?? "";
        this.username = parameters?.username ?? "";
        this.password = parameters?.password ?? "";
        this.integratedSecurity = parameters?.integratedSecurity ?? false;
        this.extraParams = parameters?.extraParams ?? {};
      }
    }
    Database.OracleParameters = OracleParameters;
    class PostgresParameters {
      host;
      port;
      database;
      username;
      password;
      options;
      connectTimeout;
      keepalives;
      keepalivesIdle;
      constructor(parameters) {
        this.host = parameters?.host ?? "localhost";
        this.port = parameters?.port ?? 5432;
        this.database = parameters?.database ?? "";
        this.username = parameters?.username ?? "";
        this.password = parameters?.password ?? "";
        this.options = parameters?.options;
        this.connectTimeout = parameters?.connectTimeout;
        this.keepalives = parameters?.keepalives;
        this.keepalivesIdle = parameters?.keepalivesIdle;
      }
    }
    Database.PostgresParameters = PostgresParameters;
  })(exports.Database || (exports.Database = {}));

  class EventAgent {
    async emit(events) {
      const eventsArgs = events.map((event) => {
        const {
          labelName,
          sourceDigitalIdentity,
          targetDigitalIdentity,
          sourceDID,
          targetDID,
          meta,
          type,
        } = event;
        const source = sourceDID ?? sourceDigitalIdentity ?? undefined;
        if (source === undefined) {
          throw Error("sourceDigitalIdentity is undefined");
        }
        const target = targetDID ?? targetDigitalIdentity ?? undefined;
        if (target === undefined) {
          throw Error("targetDigitalIdentity is undefined");
        }
        const eventArgs = {
          labelName,
          sourceDigitalIdentity: source,
          targetDigitalIdentity: target,
          meta,
          type,
        };
        return eventArgs;
      });
      await Deno.core.opAsync("op_event_agent_emit", eventsArgs);
    }
    async search(request) {
      return Deno.core.opAsync("op_event_agent_search", request);
    }
    async searchWithPattern(request) {
      return Deno.core.opAsync("op_event_agent_search_with_pattern", request);
    }
  }

  class FileStorageAgent {
    async simpleGet(url) {
      return Deno.core.opAsync(
        "op_file_storage_agent_simple_get",
        url instanceof URL ? url.href : url
      );
    }
    async simplePut(url, data, options) {
      const byteArray = typeof data === "string" ? Deno.core.encode(data) : data;
      return Deno.core.opAsync(
        "op_file_storage_agent_simple_put",
        {
          url: url instanceof URL ? url.href : url,
          ensureDir: options?.ensureDir ?? false,
        },
        byteArray
      );
    }
    async delete(url) {
      return Deno.core.opAsync(
        "op_file_storage_agent_delete",
        url instanceof URL ? url.href : url
      );
    }
    async list(url) {
      return Deno.core.opAsync(
        "op_file_storage_agent_list",
        url instanceof URL ? url.href : url
      );
    }
    async createDirAll(url) {
      return Deno.core.opAsync(
        "op_file_storage_agent_create_dir_all",
        url instanceof URL ? url.href : url
      );
    }
  }

  class HttpAgent {
    async send(request, config) {
      const { method, url, headers, contentType, body } = request;
      const req = { method, url, headers, contentType, config };
      return Deno.core.opAsync("op_http_agent_send", req, body);
    }
    async get(url, headers, contentType, body = null, config = null) {
      return this.send(
        new exports.Http.Request(exports.Http.Method.GET, url, headers, contentType, body),
        config
      );
    }
    async post(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(exports.Http.Method.POST, url, headers, contentType, body),
        config
      );
    }
    async patch(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(exports.Http.Method.PATCH, url, headers, contentType, body),
        config
      );
    }
    async put(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(exports.Http.Method.PUT, url, headers, contentType, body),
        config
      );
    }
    async delete(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(exports.Http.Method.DELETE, url, headers, contentType, body),
        config
      );
    }
  }
  function urlQueryString(init) {
    let params = [];
    if (typeof init === "string") {
      if (init[0] === "?") {
        init = init.slice(1);
      }
      return init;
    } else if (Array.isArray(init)) {
      for (const pair of init) {
        params.push([String(pair[0]), String(pair[1])]);
      }
    } else {
      for (const [key, value] of Object.entries(init)) {
        params.push([String(key), String(value)]);
      }
    }
    return params.map((p) => `${encodeURI(p[0])}=${encodeURI(p[1])}`).join("&");
  }
  exports.Http = void 0;
  (function (Http) {
    let Method;
    (function (Method) {
      Method["GET"] = "Get";
      Method["POST"] = "Post";
      Method["PATCH"] = "Patch";
      Method["PUT"] = "Put";
      Method["DELETE"] = "Delete";
    })((Method = Http.Method || (Http.Method = {})));
    let ContentType;
    (function (ContentType) {
      ContentType["None"] = "None";
      ContentType["PlantText"] = "PlantText";
      ContentType["Json"] = "Json";
      ContentType["Form"] = "Form";
    })((ContentType = Http.ContentType || (Http.ContentType = {})));
    class Request {
      method;
      url;
      headers;
      contentType;
      body;
      constructor(
        method = Method.GET,
        url = "",
        headers = {},
        contentType = ContentType.None,
        body = null
      ) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.contentType = contentType;
        this.body = body;
      }
      setJson(body) {
        this.body = Deno.core.encode(JSON.stringify(body));
        this.contentType = ContentType.Json;
        return this;
      }
      setForm(body) {
        this.body = Deno.core.encode(urlQueryString(body));
        this.contentType = ContentType.Form;
        return this;
      }
    }
    Http.Request = Request;
    class Config {
      acceptInvalidCerts;
      constructor(acceptInvalidCerts = false) {
        this.acceptInvalidCerts = acceptInvalidCerts;
      }
    }
    Http.Config = Config;
  })(exports.Http || (exports.Http = {}));

  class LocalStorageAgent {
    async get(key) {
      return Deno.core.opAsync("op_local_storage_agent_get", key);
    }
    async putString(key, value, timeout) {
      await Deno.core.opAsync("op_local_storage_agent_put", {
        key,
        value: { String: value },
        timeout: timeout || null,
      });
    }
    async putByteArray(key, value, timeout) {
      const byteArray =
        typeof value === "string" ? Deno.core.encode(value) : value;
      await Deno.core.opAsync("op_local_storage_agent_put", {
        key,
        value: { ByteArray: byteArray },
        timeout: timeout || 0,
      });
    }
    async putJson(key, value, timeout) {
      await Deno.core.opAsync("op_local_storage_agent_put", {
        key,
        value: { Json: value },
        timeout,
      });
    }
    async delete(key) {
      await Deno.core.opAsync("op_local_storage_agent_delete", key);
    }
    async remove(key) {
      await this.delete(key);
    }
  }

  class LoggingAgent {
    trace(value) {
      this.log("Trace", value);
    }
    debug(value) {
      this.log("Debug", value);
    }
    info(value) {
      this.log("Info", value);
    }
    warn(value) {
      this.log("Warn", value);
    }
    error(value) {
      this.log("Error", value);
    }
    log(level, value) {
      let message;
      if (typeof value === "string") {
        message = { String: value };
      } else {
        message = { Json: value };
      }
      let record = { level, message };
      Deno.core.opSync("op_log", record);
    }
  }

  class ResultAgent {
    finalize(value) {
      Deno.core.opSync("op_result_agent_set", value);
    }
  }

  class SessionStorageAgent {
    async get(key) {
      return Deno.core.opAsync("op_session_storage_agent_get", key);
    }
    async putJson(key, value) {
      return Deno.core.opAsync("op_session_storage_agent_put", {
        key,
        value: { Json: value },
      });
    }
    async putString(key, value) {
      return Deno.core.opAsync("op_session_storage_agent_put", {
        key,
        value: { String: value },
      });
    }
    async putByteArray(key, value) {
      const byteArray =
        typeof value === "string" ? Deno.core.encode(value) : value;
      return Deno.core.opAsync("op_session_storage_agent_put", {
        key,
        value: { ByteArray: byteArray },
      });
    }
    async delete(key) {
      await Deno.core.opAsync("op_session_storage_agent_delete", key);
    }
    async remove(key) {
      await this.delete(key);
    }
  }

  class SmtpAgent {
    async connect(host, username, password) {
      let credential = null;
      if (username !== null && password != null) {
        credential = { username, password };
      }
      const uid = await Deno.core.opAsync("op_smtp_agent_connect", {
        host,
        credential,
      });
      return new SmtpAgentHub(uid);
    }
  }
  class SmtpAgentHub {
    uid;
    constructor(uid) {
      this.uid = uid;
    }
    async send(mail) {
      if (mail.sender.mail === null) {
        throw new TypeError("mail sender should not be empty");
      }
      if (mail.receivers.length === 0) {
        throw new TypeError("mail receivers should not be empty");
      }
      if (mail.subject.length === 0) {
        throw new TypeError("mail subject should not be empty");
      }
      if (mail.body.length === 0) {
        throw new TypeError("mail body should not be empty");
      }
      return Deno.core.opAsync("op_smtp_agent_send", { uid: this.uid, mail });
    }
  }
  exports.Smtp = void 0;
  (function (Smtp) {
    class Mail {
      sender;
      receivers;
      replyTo;
      cc;
      bcc;
      subject;
      body;
      constructor() {
        this.sender = { mail: "", name: "" };
        this.receivers = [];
        this.replyTo = undefined;
        this.cc = [];
        this.bcc = [];
        this.subject = "";
        this.body = "";
      }
      setSender(mail, name = "") {
        this.sender = { mail, name };
        return this;
      }
      setReceivers(mail, name = "") {
        this.receivers.push({ mail, name });
        return this;
      }
      setReplyTo(mail, name = "") {
        this.replyTo = { mail, name };
        return this;
      }
      setCC(mail, name = "") {
        this.cc.push({ mail, name });
        return this;
      }
      setBCC(mail, name = "") {
        this.bcc.push({ mail, name });
        return this;
      }
      setSubject(subject) {
        this.subject = subject;
        return this;
      }
      setBody(body) {
        this.body = body;
        return this;
      }
    }
    Smtp.Mail = Mail;
  })(exports.Smtp || (exports.Smtp = {}));

  class AggregatorAgents {
    sessionStorage;
    logging;
    result;
    constructor() {
      this.sessionStorage = new SessionStorageAgent();
      this.logging = new LoggingAgent();
      this.result = new ResultAgent();
    }
  }
  class AggregatorContext extends AbstractContext {
    agents;
    constructor() {
      super();
      this.agents = new AggregatorAgents();
    }
  }

  class GenericAgents {
    sessionStorage;
    logging;
    eventStore;
    localStorage;
    http;
    fileStorage;
    database;
    smtp;
    constructor() {
      this.sessionStorage = new SessionStorageAgent();
      this.logging = new LoggingAgent();
      this.eventStore = new EventAgent();
      this.http = new HttpAgent();
      this.fileStorage = new FileStorageAgent();
      this.localStorage = new LocalStorageAgent();
      this.database = new DatabaseAgent();
      this.smtp = new SmtpAgent();
    }
  }
  class GenericContext extends AbstractContext {
    agents;
    constructor() {
      super();
      this.agents = new GenericAgents();
    }
  }

  class Railway {
    static async isOk() {
      return Deno.core.opAsync("op_railway_is_ok");
    }
    static async switch(err) {
      if (err instanceof Error) {
        let { name, message } = err;
        await Deno.core.opAsync("op_railway_switch", { name, message });
      } else if (typeof err === "string") {
        await Deno.core.opAsync("op_railway_switch", {
          name: "CustomError",
          message: err,
        });
      } else {
        await Deno.core.opAsync("op_railway_switch", {
          name: "CustomError",
          message: `${err}`,
        });
      }
    }
    static async getError() {
      let { name, message, logicPermanentIdentity, logicRevision } =
        await Deno.core.opAsync("op_railway_get_error");
      return new RailwayError(
        name,
        message,
        logicPermanentIdentity,
        logicRevision
      );
    }
  }
  class RailwayError extends Error {
    logicPermanentIdentity;
    logicRevision;
    constructor(name, message, logicPermanentIdentity, logicRevision) {
      super(message);
      this.name = name;
      this.logicPermanentIdentity = logicPermanentIdentity;
      this.logicRevision = logicRevision;
    }
  }

  async function empty() {}
  class RuntimeError extends Error {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  }
  class Runtime {
    #context;
    #run;
    #main;
    #errorHandler;
    constructor(context) {
      this.#context = context;
      this.#run = false;
      this.#main = empty;
      this.#errorHandler = empty;
    }
    registerMain(main) {
      if (this.#main !== empty) {
        throw new RuntimeError("main is already registered");
      }
      this.#main = main;
    }
    registerErrorHandler(errorHandler) {
      if (this.#errorHandler !== empty) {
        throw new RuntimeError("error handler is already registered");
      }
      this.#errorHandler = errorHandler;
    }
    get context() {
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

  Object.assign(globalThis, {
    AggregatorContext,
    GenericContext,
  });
  exports.runtime = void 0;
  function genericLogic() {
    const context = new GenericContext();
    exports.runtime = new Runtime(context);
  }
  function aggregatorLogic() {
    const context = new AggregatorContext();
    exports.runtime = new Runtime(context);
  }

  exports.aggregatorLogic = aggregatorLogic;
  exports.genericLogic = genericLogic;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZXh0L2NvbnRleHQudHMiLCIuLi9zcmMvYWdlbnQvZGF0YWJhc2UudHMiLCIuLi9zcmMvYWdlbnQvZXZlbnQudHMiLCIuLi9zcmMvYWdlbnQvZmlsZV9zdG9yYWdlLnRzIiwiLi4vc3JjL2FnZW50L2h0dHAudHMiLCIuLi9zcmMvYWdlbnQvbG9jYWxfc3RvcmFnZS50cyIsIi4uL3NyYy9hZ2VudC9sb2dnaW5nLnRzIiwiLi4vc3JjL2FnZW50L3Jlc3VsdC50cyIsIi4uL3NyYy9hZ2VudC9zZXNzaW9uX3N0b3JhZ2UudHMiLCIuLi9zcmMvYWdlbnQvc210cC50cyIsIi4uL3NyYy9jb250ZXh0L2FnZ3JlZ2F0b3IudHMiLCIuLi9zcmMvY29udGV4dC9nZW5lcmljLnRzIiwiLi4vc3JjL3ByaW1pdGl2ZS9yYWlsd2F5LnRzIiwiLi4vc3JjL3J1bnRpbWUudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sIm5hbWVzIjpbIkRhdGFiYXNlIiwiSHR0cCIsIlNtdHAiLCJydW50aW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7UUFJc0IsZUFBZTs7OztVQUtqQztVQUNBLEtBQUs7O0dBRVI7RUFFRCxTQUFTLGlCQUFpQjs4REFDZ0M7MkJBQ25DO2tCQUNYLEtBQUssa0JBQWtCLEtBQUssYUFBYSxLQUFLLElBQUksQ0FBQzs7Ozs7TUFZN0QsT0FBTztFQUNUO0VBRUE7O0VBRUE7Ozs7Ozs7UUM5QmEsYUFBYTs7Ozs7OztnREFXYzs7O21CQUUzQjs7ZUFFTjtpQ0FBb0IscUJBQXFCO3lDQUNqQkEsaUJBQVM7O21CQUMzQjt5Q0FDa0IsRUFBRTtlQUMxQjtpQ0FBb0IsWUFBWTs7Ozs7OztvQkFPekI7Ozs7Ozs7RUFPZCxhQUFhO01BQ1U7O1VBQUEsY0FBRztNQUFx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
