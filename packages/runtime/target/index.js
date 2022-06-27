(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.Saffron = {})));
})(this, function (exports) {
  "use strict";

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
      await Deno.core.opAsync(
        "op_database_agent_rollback_transaction",
        this.uid
      );
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
    })(Database.Driver || (Database.Driver = {}));
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
      const byteArray =
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
        new exports.Http.Request(
          exports.Http.Method.GET,
          url,
          headers,
          contentType,
          body
        ),
        config
      );
    }
    async post(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(
          exports.Http.Method.POST,
          url,
          headers,
          contentType,
          body
        ),
        config
      );
    }
    async patch(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(
          exports.Http.Method.PATCH,
          url,
          headers,
          contentType,
          body
        ),
        config
      );
    }
    async put(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(
          exports.Http.Method.PUT,
          url,
          headers,
          contentType,
          body
        ),
        config
      );
    }
    async delete(url, headers, contentType, body, config = null) {
      return this.send(
        new exports.Http.Request(
          exports.Http.Method.DELETE,
          url,
          headers,
          contentType,
          body
        ),
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

  Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZXh0L2NvbnRleHQudHMiLCIuLi9zcmMvYWdlbnQvZGF0YWJhc2UudHMiLCIuLi9zcmMvYWdlbnQvZXZlbnQudHMiLCIuLi9zcmMvYWdlbnQvZmlsZV9zdG9yYWdlLnRzIiwiLi4vc3JjL2FnZW50L2h0dHAudHMiLCIuLi9zcmMvYWdlbnQvbG9jYWxfc3RvcmFnZS50cyIsIi4uL3NyYy9hZ2VudC9sb2dnaW5nLnRzIiwiLi4vc3JjL2FnZW50L3Jlc3VsdC50cyIsIi4uL3NyYy9hZ2VudC9zZXNzaW9uX3N0b3JhZ2UudHMiLCIuLi9zcmMvYWdlbnQvc210cC50cyIsIi4uL3NyYy9jb250ZXh0L2FnZ3JlZ2F0b3IudHMiLCIuLi9zcmMvY29udGV4dC9nZW5lcmljLnRzIiwiLi4vc3JjL3ByaW1pdGl2ZS9yYWlsd2F5LnRzIiwiLi4vc3JjL3J1bnRpbWUudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sIm5hbWVzIjpbIkRhdGFiYXNlIiwiSHR0cCIsIlNtdHAiLCJydW50aW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7VUFJc0IsZUFBZTtRQUMxQixPQUFPLENBQVU7UUFDakIsSUFBSSxDQUFPO1FBRXBCO1lBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxFQUFFLENBQUM7U0FDOUI7S0FDRjtJQUVELFNBQVMsaUJBQWlCO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDMUQsSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUs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
