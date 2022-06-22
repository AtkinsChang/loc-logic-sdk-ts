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
            payload.http.body = Uint8Array.from(atob(payload.http.body), (c) => c.charCodeAt(0));
        }
        if ("messageQueue" in payload) {
            payload.messageQueue.data = Uint8Array.from(atob(payload.messageQueue.data), (c) => c.charCodeAt(0));
        }
        return payload;
    }
    function initializeTask() {
        return Deno.core.opSync("op_initialize_task");
    }

    class DatabaseAgent {
        async connect({ databaseDriver, connectionString = null, connection = null, }) {
            let connectionParameters;
            if (typeof connectionString === "string") {
                connectionParameters = { plainConnectionString: connectionString };
            }
            else {
                if (typeof connection === "string") {
                    connectionParameters = { plainConnectionString: connection };
                }
                else if (connection instanceof exports.Database.MssqlParameters) {
                    connectionParameters = { mssql: connection };
                }
                else if (connection instanceof exports.Database.MySqlParameters) {
                    connectionParameters = { mySql: connection };
                }
                else if (connection instanceof exports.Database.OracleParameters) {
                    connectionParameters = { oracle: connection };
                }
                else if (connection instanceof exports.Database.PostgresParameters) {
                    connectionParameters = { postgres: connection };
                }
                else {
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
            return Deno.core.opAsync("op_database_agent_execute", { uid: this.uid, rawSql, params });
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
                const { labelName, sourceDigitalIdentity, targetDigitalIdentity, sourceDID, targetDID, meta, type, } = event;
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
            return Deno.core.opAsync("op_file_storage_agent_simple_get", url instanceof URL ? url.href : url);
        }
        async simplePut(url, data, options) {
            const byteArray = typeof data === "string" ? Deno.core.encode(data) : data;
            return Deno.core.opAsync("op_file_storage_agent_simple_put", {
                url: url instanceof URL ? url.href : url,
                ensureDir: options?.ensureDir ?? false,
            }, byteArray);
        }
        async delete(url) {
            return Deno.core.opAsync("op_file_storage_agent_delete", url instanceof URL ? url.href : url);
        }
        async list(url) {
            return Deno.core.opAsync("op_file_storage_agent_list", url instanceof URL ? url.href : url);
        }
        async createDirAll(url) {
            return Deno.core.opAsync("op_file_storage_agent_create_dir_all", url instanceof URL ? url.href : url);
        }
    }

    class HttpAgent {
        async send(request, config) {
            const { method, url, headers, contentType, body } = request;
            const req = { method, url, headers, contentType, config };
            return Deno.core.opAsync("op_http_agent_send", req, body);
        }
        async get(url, headers, contentType, body = null, config = null) {
            return this.send(new exports.Http.Request(exports.Http.Method.GET, url, headers, contentType, body), config);
        }
        async post(url, headers, contentType, body, config = null) {
            return this.send(new exports.Http.Request(exports.Http.Method.POST, url, headers, contentType, body), config);
        }
        async patch(url, headers, contentType, body, config = null) {
            return this.send(new exports.Http.Request(exports.Http.Method.PATCH, url, headers, contentType, body), config);
        }
        async put(url, headers, contentType, body, config = null) {
            return this.send(new exports.Http.Request(exports.Http.Method.PUT, url, headers, contentType, body), config);
        }
        async delete(url, headers, contentType, body, config = null) {
            return this.send(new exports.Http.Request(exports.Http.Method.DELETE, url, headers, contentType, body), config);
        }
    }
    function urlQueryString(init) {
        let params = [];
        if (typeof init === "string") {
            if (init[0] === "?") {
                init = init.slice(1);
            }
            return init;
        }
        else if (Array.isArray(init)) {
            for (const pair of init) {
                params.push([String(pair[0]), String(pair[1])]);
            }
        }
        else {
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
        })(Method = Http.Method || (Http.Method = {}));
        let ContentType;
        (function (ContentType) {
            ContentType["None"] = "None";
            ContentType["PlantText"] = "PlantText";
            ContentType["Json"] = "Json";
            ContentType["Form"] = "Form";
        })(ContentType = Http.ContentType || (Http.ContentType = {}));
        class Request {
            method;
            url;
            headers;
            contentType;
            body;
            constructor(method = Method.GET, url = "", headers = {}, contentType = ContentType.None, body = null) {
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
            const byteArray = typeof value === "string" ? Deno.core.encode(value) : value;
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
            }
            else {
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
            const byteArray = typeof value === "string" ? Deno.core.encode(value) : value;
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
            }
            else if (typeof err === "string") {
                await Deno.core.opAsync("op_railway_switch", { name: "CustomError", message: err });
            }
            else {
                await Deno.core.opAsync("op_railway_switch", { name: "CustomError", message: `${err}` });
            }
        }
        static async getError() {
            let { name, message, logicPermanentIdentity, logicRevision } = await Deno.core.opAsync("op_railway_get_error");
            return new RailwayError(name, message, logicPermanentIdentity, logicRevision);
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

    async function empty() { }
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
            if (this.#main === empty &&
                this.#errorHandler === empty &&
                globalThis.run instanceof Function &&
                globalThis.run.length === 1 &&
                globalThis.handleError instanceof Function &&
                globalThis.handleError.length === 2) {
                this.#main = globalThis.run.bind(null, this.#context);
                this.#errorHandler = globalThis.handleError.bind(null, this.#context);
            }
            if (await Railway.isOk()) {
                try {
                    await this.#main();
                }
                catch (error) {
                    Railway.switch(error);
                    await this.#errorHandler(await Railway.getError());
                }
            }
            else {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250ZXh0L2NvbnRleHQudHMiLCIuLi9zcmMvYWdlbnQvZGF0YWJhc2UudHMiLCIuLi9zcmMvYWdlbnQvZXZlbnQudHMiLCIuLi9zcmMvYWdlbnQvZmlsZV9zdG9yYWdlLnRzIiwiLi4vc3JjL2FnZW50L2h0dHAudHMiLCIuLi9zcmMvYWdlbnQvbG9jYWxfc3RvcmFnZS50cyIsIi4uL3NyYy9hZ2VudC9sb2dnaW5nLnRzIiwiLi4vc3JjL2FnZW50L3Jlc3VsdC50cyIsIi4uL3NyYy9hZ2VudC9zZXNzaW9uX3N0b3JhZ2UudHMiLCIuLi9zcmMvYWdlbnQvc210cC50cyIsIi4uL3NyYy9jb250ZXh0L2FnZ3JlZ2F0b3IudHMiLCIuLi9zcmMvY29udGV4dC9nZW5lcmljLnRzIiwiLi4vc3JjL3ByaW1pdGl2ZS9yYWlsd2F5LnRzIiwiLi4vc3JjL3J1bnRpbWUudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOltudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbCxudWxsLG51bGwsbnVsbF0sIm5hbWVzIjpbIkRhdGFiYXNlIiwiSHR0cCIsIlNtdHAiLCJydW50aW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7VUFJc0IsZUFBZTtRQUMxQixPQUFPLENBQVU7UUFDakIsSUFBSSxDQUFPO1FBRXBCO1lBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxFQUFFLENBQUM7U0FDOUI7S0FDRjtJQUVELFNBQVMsaUJBQWlCO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDMUQsSUFBSSxNQUFNLElBQUksT0FBTyxFQUFFO1lBQ3JCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RGO1FBRUQsSUFBSSxjQUFjLElBQUksT0FBTyxFQUFFO1lBQzdCLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQzdFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQ2hCLENBQUM7U0FDSDtRQUVELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxTQUFTLGNBQWM7UUFDckIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQ2hEOztVQzNCYSxhQUFhO1FBQ3hCLE1BQU0sT0FBTyxDQUFDLEVBQ1osY0FBYyxFQUNkLGdCQUFnQixHQUFHLElBQUksRUFDdkIsVUFBVSxHQUFHLElBQUksR0FDRDtZQUNoQixJQUFJLG9CQUFvQixDQUFDO1lBRXpCLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLEVBQUU7Z0JBQ3hDLG9CQUFvQixHQUFHLEVBQUUscUJBQXFCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQzthQUNwRTtpQkFBTTtnQkFDTCxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtvQkFDbEMsb0JBQW9CLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDOUQ7cUJBQU0sSUFBSSxVQUFVLFlBQVlBLGdCQUFRLENBQUMsZUFBZSxFQUFFO29CQUN6RCxvQkFBb0IsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDOUM7cUJBQU0sSUFBSSxVQUFVLFlBQVlBLGdCQUFRLENBQUMsZUFBZSxFQUFFO29CQUN6RCxvQkFBb0IsR0FBRyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDOUM7cUJBQU0sSUFBSSxVQUFVLFlBQVlBLGdCQUFRLENBQUMsZ0JBQWdCLEVBQUU7b0JBQzFELG9CQUFvQixHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDO2lCQUMvQztxQkFBTSxJQUFJLFVBQVUsWUFBWUEsZ0JBQVEsQ0FBQyxrQkFBa0IsRUFBRTtvQkFDNUQsb0JBQW9CLEdBQUcsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLENBQUM7aUJBQ2pEO3FCQUFNO29CQUNMLE1BQU0sSUFBSSxTQUFTLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztpQkFDdkQ7YUFDRjtZQUVELElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUU7Z0JBQzdELGNBQWM7Z0JBQ2QsVUFBVSxFQUFFLG9CQUFvQjthQUNqQyxDQUFDLENBQUM7WUFDSCxPQUFPLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2hDO0tBQ0Y7VUFDWSxjQUFjO1FBQ0o7UUFBckIsWUFBcUIsR0FBcUI7WUFBckIsUUFBRyxHQUFILEdBQUcsQ0FBa0I7U0FBSTtRQUU5QyxNQUFNLEtBQUssQ0FBQyxNQUFjLEVBQUUsTUFBYTtZQU12QyxJQUFJLE9BQU8sR0FBaUIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRTtnQkFDN0UsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2dCQUNiLE1BQU07Z0JBQ04sTUFBTTthQUNQLENBQUMsQ0FBQztZQUVILE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFjLEVBQUUsR0FBUTtnQkFFMUQsSUFBSSxNQUFNLEdBQVEsRUFBRSxDQUFDO2dCQUNyQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQy9DLE1BQU0sVUFBVSxHQUFHLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO29CQUM3QyxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7d0JBQzVCLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMvQztpQkFDRjtnQkFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyQixPQUFPLE9BQU8sQ0FBQzthQUNoQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRVAsT0FBTyxPQUFPLENBQUM7U0FDaEI7UUFFRCxNQUFNLFVBQVU7WUFDZCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNuRTtRQUVELE1BQU0sT0FBTyxDQUFDLE1BQWMsRUFBRSxNQUFhO1lBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUMxRjtRQUVELE1BQU0sZ0JBQWdCO1lBQ3BCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLGlCQUFpQjtZQUNyQixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzRTtRQUVELE1BQU0sbUJBQW1CO1lBQ3ZCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsd0NBQXdDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdFO0tBQ0Y7QUFFZ0JBLDhCQTZJaEI7SUE3SUQsV0FBaUIsUUFBUTtRQU92QixXQUFZLE1BQU07WUFDaEIsK0JBQXFCLENBQUE7WUFDckIseUJBQWUsQ0FBQTtZQUNmLHlCQUFlLENBQUE7WUFDZixxQkFBVyxDQUFBO1lBQ1gsMkJBQWlCLENBQUE7WUFDakIsaUNBQXVCLENBQUE7U0FDeEIsRUFQVyxlQUFNLEtBQU4sZUFBTSxRQU9qQjtRQVdELE1BQWEsZUFBZTtZQUNqQixJQUFJLENBQVM7WUFDYixJQUFJLENBQVM7WUFDYixRQUFRLENBQVM7WUFDakIsUUFBUSxDQUFTO1lBQ2pCLFFBQVEsQ0FBUztZQUNqQixTQUFTLENBQVc7WUFDcEIsWUFBWSxDQUFVO1lBRS9CLFlBQVksVUFBNkI7Z0JBQ3ZDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxFQUFFLElBQUksSUFBSSxXQUFXLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxFQUFFLElBQUksSUFBSSxJQUFJLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxFQUFFLFNBQVMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLEVBQUUsWUFBWSxDQUFDO2FBQzlDO1NBQ0Y7UUFsQlksd0JBQWUsa0JBa0IzQixDQUFBO1FBU0QsTUFBYSxlQUFlO1lBQ2pCLElBQUksQ0FBUztZQUNiLElBQUksQ0FBUztZQUNiLFFBQVEsQ0FBUztZQUNqQixRQUFRLENBQVM7WUFDakIsUUFBUSxDQUFTO1lBRTFCLFlBQVksVUFBNkI7Z0JBQ3ZDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxFQUFFLElBQUksSUFBSSxXQUFXLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxFQUFFLElBQUksSUFBSSxJQUFJLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxRQUFRLEdBQUcsVUFBVSxFQUFFLFFBQVEsSUFBSSxFQUFFLENBQUM7YUFDNUM7U0FDRjtRQWRZLHdCQUFlLGtCQWMzQixDQUFBO1FBV0QsTUFBYSxnQkFBZ0I7WUFDbEIsSUFBSSxDQUFTO1lBQ2IsSUFBSSxDQUFTO1lBQ2IsV0FBVyxDQUFTO1lBQ3BCLFFBQVEsQ0FBUztZQUNqQixRQUFRLENBQVM7WUFDakIsa0JBQWtCLENBQVU7WUFDNUIsV0FBVyxDQUEwQjtZQUU5QyxZQUFZLFVBQThCO2dCQUN4QyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsRUFBRSxJQUFJLElBQUksV0FBVyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsRUFBRSxXQUFXLElBQUksRUFBRSxDQUFDO2dCQUNqRCxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsRUFBRSxRQUFRLElBQUksRUFBRSxDQUFDO2dCQUMzQyxJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsRUFBRSxRQUFRLElBQUksRUFBRSxDQUFDO2dCQUMzQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsVUFBVSxFQUFFLGtCQUFrQixJQUFJLEtBQUssQ0FBQztnQkFDbEUsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLEVBQUUsV0FBVyxJQUFJLEVBQUUsQ0FBQzthQUNsRDtTQUNGO1FBbEJZLHlCQUFnQixtQkFrQjVCLENBQUE7UUFhRCxNQUFhLGtCQUFrQjtZQUNwQixJQUFJLENBQVM7WUFDYixJQUFJLENBQVM7WUFDYixRQUFRLENBQVM7WUFDakIsUUFBUSxDQUFTO1lBQ2pCLFFBQVEsQ0FBUztZQUNqQixPQUFPLENBQVU7WUFDakIsY0FBYyxDQUFVO1lBQ3hCLFVBQVUsQ0FBVztZQUNyQixjQUFjLENBQVU7WUFFakMsWUFBWSxVQUFnQztnQkFDMUMsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLEVBQUUsSUFBSSxJQUFJLFdBQVcsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQztnQkFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLEVBQUUsUUFBUSxJQUFJLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLEVBQUUsUUFBUSxJQUFJLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLEVBQUUsUUFBUSxJQUFJLEVBQUUsQ0FBQztnQkFDM0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLEVBQUUsT0FBTyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsRUFBRSxjQUFjLENBQUM7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxFQUFFLFVBQVUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLEVBQUUsY0FBYyxDQUFDO2FBQ2xEO1NBQ0Y7UUF0QlksMkJBQWtCLHFCQXNCOUIsQ0FBQTtJQVdILENBQUMsRUE3SWdCQSxnQkFBUSxLQUFSQSxnQkFBUTs7VUN6RlosVUFBVTtRQUNyQixNQUFNLElBQUksQ0FBQyxNQUFxQjtZQUM5QixNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSztnQkFDbEMsTUFBTSxFQUNKLFNBQVMsRUFDVCxxQkFBcUIsRUFDckIscUJBQXFCLEVBQ3JCLFNBQVMsRUFDVCxTQUFTLEVBQ1QsSUFBSSxFQUNKLElBQUksR0FDTCxHQUFHLEtBQUssQ0FBQztnQkFFVixNQUFNLE1BQU0sR0FBRyxTQUFTLElBQUkscUJBQXFCLElBQUksU0FBUyxDQUFDO2dCQUMvRCxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7b0JBQ3hCLE1BQU0sS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7aUJBQ25EO2dCQUVELE1BQU0sTUFBTSxHQUFHLFNBQVMsSUFBSSxxQkFBcUIsSUFBSSxTQUFTLENBQUM7Z0JBQy9ELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsTUFBTSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztpQkFDbkQ7Z0JBRUQsTUFBTSxTQUFTLEdBQUc7b0JBQ2hCLFNBQVM7b0JBQ1QscUJBQXFCLEVBQUUsTUFBTTtvQkFDN0IscUJBQXFCLEVBQUUsTUFBTTtvQkFDN0IsSUFBSTtvQkFDSixJQUFJO2lCQUNMLENBQUM7Z0JBRUYsT0FBTyxTQUFTLENBQUM7YUFDbEIsQ0FBQyxDQUFDO1lBRUgsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM1RDtRQUVELE1BQU0sTUFBTSxDQUFDLE9BQXNCO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDNUQ7UUFFRCxNQUFNLGlCQUFpQixDQUFDLE9BQXVCO1lBQzdDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDekU7OztVQzdDVSxnQkFBZ0I7UUFFM0IsTUFBTSxTQUFTLENBQUMsR0FBaUI7WUFDL0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDdEIsa0NBQWtDLEVBQ2xDLEdBQUcsWUFBWSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQ3BDLENBQUM7U0FDSDtRQUVELE1BQU0sU0FBUyxDQUNiLEdBQWlCLEVBQ2pCLElBQXlCLEVBQ3pCLE9BQWdDO1lBRWhDLE1BQU0sU0FBUyxHQUFlLE9BQU8sSUFBSSxLQUFLLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFFdkYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDdEIsa0NBQWtDLEVBQ2xDO2dCQUNFLEdBQUcsRUFBRSxHQUFHLFlBQVksR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRztnQkFDeEMsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLElBQUksS0FBSzthQUN2QyxFQUNELFNBQVMsQ0FDVixDQUFDO1NBQ0g7UUFFRCxNQUFNLE1BQU0sQ0FBQyxHQUFpQjtZQUM1QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDhCQUE4QixFQUFFLEdBQUcsWUFBWSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztTQUMvRjtRQUVELE1BQU0sSUFBSSxDQUFDLEdBQWlCO1lBQzFCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxZQUFZLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQzdGO1FBRUQsTUFBTSxZQUFZLENBQUMsR0FBaUI7WUFDbEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDdEIsc0NBQXNDLEVBQ3RDLEdBQUcsWUFBWSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQ3BDLENBQUM7U0FDSDs7O1VDdkNVLFNBQVM7UUFDcEIsTUFBTSxJQUFJLENBQUMsT0FBcUIsRUFBRSxNQUEwQjtZQUMxRCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQztZQUM1RCxNQUFNLEdBQUcsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUUxRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUMzRDtRQUVELE1BQU0sR0FBRyxDQUNQLEdBQVcsRUFDWCxPQUErQixFQUMvQixXQUE2QixFQUM3QixPQUEwQixJQUFJLEVBQzlCLFNBQTZCLElBQUk7WUFFakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUlDLFlBQUksQ0FBQyxPQUFPLENBQUNBLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzlGO1FBRUQsTUFBTSxJQUFJLENBQ1IsR0FBVyxFQUNYLE9BQStCLEVBQy9CLFdBQTZCLEVBQzdCLElBQXVCLEVBQ3ZCLFNBQTZCLElBQUk7WUFFakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUlBLFlBQUksQ0FBQyxPQUFPLENBQUNBLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQy9GO1FBRUQsTUFBTSxLQUFLLENBQ1QsR0FBVyxFQUNYLE9BQStCLEVBQy9CLFdBQTZCLEVBQzdCLElBQXVCLEVBQ3ZCLFNBQTZCLElBQUk7WUFFakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUlBLFlBQUksQ0FBQyxPQUFPLENBQUNBLFlBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2hHO1FBRUQsTUFBTSxHQUFHLENBQ1AsR0FBVyxFQUNYLE9BQStCLEVBQy9CLFdBQTZCLEVBQzdCLElBQXVCLEVBQ3ZCLFNBQTZCLElBQUk7WUFFakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUlBLFlBQUksQ0FBQyxPQUFPLENBQUNBLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzlGO1FBRUQsTUFBTSxNQUFNLENBQ1YsR0FBVyxFQUNYLE9BQStCLEVBQy9CLFdBQTZCLEVBQzdCLElBQXVCLEVBQ3ZCLFNBQTZCLElBQUk7WUFFakMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUlBLFlBQUksQ0FBQyxPQUFPLENBQUNBLFlBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ2pHO0tBQ0Y7SUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFTO1FBQy9CLElBQUksTUFBTSxHQUF1QixFQUFFLENBQUM7UUFFcEMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDNUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUNuQixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN0QjtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7YUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDOUIsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLEVBQUU7Z0JBR3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqRDtTQUNGO2FBQU07WUFDTCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7UUFFRCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUUsQ0FBQztBQUVnQkEsMEJBK0RoQjtJQS9ERCxXQUFpQixJQUFJO1FBQ25CLElBQVksTUFNWDtRQU5ELFdBQVksTUFBTTtZQUNoQixxQkFBVyxDQUFBO1lBQ1gsdUJBQWEsQ0FBQTtZQUNiLHlCQUFlLENBQUE7WUFDZixxQkFBVyxDQUFBO1lBQ1gsMkJBQWlCLENBQUE7U0FDbEIsRUFOVyxNQUFNLEdBQU4sV0FBTSxLQUFOLFdBQU0sUUFNakI7UUFFRCxJQUFZLFdBS1g7UUFMRCxXQUFZLFdBQVc7WUFDckIsNEJBQWEsQ0FBQTtZQUNiLHNDQUF1QixDQUFBO1lBQ3ZCLDRCQUFhLENBQUE7WUFDYiw0QkFBYSxDQUFBO1NBQ2QsRUFMVyxXQUFXLEdBQVgsZ0JBQVcsS0FBWCxnQkFBVyxRQUt0QjtRQUVELE1BQWEsT0FBTztZQUNsQixNQUFNLENBQVM7WUFDZixHQUFHLENBQVM7WUFDWixPQUFPLENBQXlCO1lBQ2hDLFdBQVcsQ0FBYztZQUN6QixJQUFJLENBQW9CO1lBRXhCLFlBQ0UsU0FBaUIsTUFBTSxDQUFDLEdBQUcsRUFDM0IsTUFBYyxFQUFFLEVBQ2hCLFVBQWtDLEVBQUUsRUFDcEMsY0FBMkIsV0FBVyxDQUFDLElBQUksRUFDM0MsT0FBMEIsSUFBSTtnQkFFOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUN2QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7YUFDbEI7WUFFRCxPQUFPLENBQUMsSUFBUztnQkFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsT0FBTyxDQUFDLElBQVM7Z0JBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFoQ1ksWUFBTyxVQWdDbkIsQ0FBQTtRQUVELE1BQWEsTUFBTTtZQUNqQixrQkFBa0IsQ0FBVTtZQUU1QixZQUFZLHFCQUE4QixLQUFLO2dCQUM3QyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsa0JBQWtCLENBQUM7YUFDOUM7U0FDRjtRQU5ZLFdBQU0sU0FNbEIsQ0FBQTtJQU9ILENBQUMsRUEvRGdCQSxZQUFJLEtBQUpBLFlBQUk7O1VDbEZSLGlCQUFpQjtRQUM1QixNQUFNLEdBQUcsQ0FBQyxHQUFXO1lBQ25CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDN0Q7UUFFRCxNQUFNLFNBQVMsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFFLE9BQWdCO1lBQzFELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUU7Z0JBQ3BELEdBQUc7Z0JBQ0gsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTtnQkFDeEIsT0FBTyxFQUFFLE9BQU8sSUFBSSxJQUFJO2FBQ3pCLENBQUMsQ0FBQztTQUNKO1FBRUQsTUFBTSxZQUFZLENBQUMsR0FBVyxFQUFFLEtBQTBCLEVBQUUsT0FBZ0I7WUFDMUUsTUFBTSxTQUFTLEdBQWUsT0FBTyxLQUFLLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUUxRixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFO2dCQUNwRCxHQUFHO2dCQUNILEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUU7Z0JBQy9CLE9BQU8sRUFBRSxPQUFPLElBQUksQ0FBQzthQUN0QixDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sT0FBTyxDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQUUsT0FBZ0I7WUFDeEQsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRTtnQkFDcEQsR0FBRztnQkFDSCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO2dCQUN0QixPQUFPO2FBQ1IsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxNQUFNLE1BQU0sQ0FBQyxHQUFXO1lBQ3RCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxNQUFNLE1BQU0sQ0FBQyxHQUFXO1lBQ3RCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN4Qjs7O1VDckNVLFlBQVk7UUFDdkIsS0FBSyxDQUFDLEtBQXNCO1lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFCO1FBRUQsS0FBSyxDQUFDLEtBQXNCO1lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFCO1FBRUQsSUFBSSxDQUFDLEtBQXNCO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxDQUFDLEtBQXNCO1lBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsS0FBSyxDQUFDLEtBQXNCO1lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFCO1FBRUQsR0FBRyxDQUFDLEtBQWEsRUFBRSxLQUFzQjtZQUN2QyxJQUFJLE9BQU8sQ0FBQztZQUVaLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUM3QixPQUFPLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDN0I7aUJBQU07Z0JBQ0wsT0FBTyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQzNCO1lBRUQsSUFBSSxNQUFNLEdBQUcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3BDOzs7VUNoQ1UsV0FBVztRQUN0QixRQUFRLENBQUMsS0FBYTtZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNoRDs7O1VDSFUsbUJBQW1CO1FBQzlCLE1BQU0sR0FBRyxDQUFDLEdBQVc7WUFDbkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUMvRDtRQUVELE1BQU0sT0FBTyxDQUFDLEdBQVcsRUFBRSxLQUFVO1lBQ25DLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUU7Z0JBQ3ZELEdBQUc7Z0JBQ0gsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTthQUN2QixDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sU0FBUyxDQUFDLEdBQVcsRUFBRSxLQUFhO1lBQ3hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUU7Z0JBQ3ZELEdBQUc7Z0JBQ0gsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRTthQUN6QixDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sWUFBWSxDQUFDLEdBQVcsRUFBRSxLQUEwQjtZQUN4RCxNQUFNLFNBQVMsR0FBZSxPQUFPLEtBQUssS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRTFGLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsOEJBQThCLEVBQUU7Z0JBQ3ZELEdBQUc7Z0JBQ0gsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTthQUNoQyxDQUFDLENBQUM7U0FDSjtRQUVELE1BQU0sTUFBTSxDQUFDLEdBQVc7WUFDdEIsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUNqRTtRQUVELE1BQU0sTUFBTSxDQUFDLEdBQVc7WUFDdEIsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3hCOzs7VUNsQ1UsU0FBUztRQUNwQixNQUFNLE9BQU8sQ0FBQyxJQUFZLEVBQUUsUUFBaUIsRUFBRSxRQUFpQjtZQUM5RCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdEIsSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7Z0JBQ3pDLFVBQVUsR0FBRyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQzthQUNyQztZQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUU7Z0JBQzNELElBQUk7Z0JBQ0osVUFBVTthQUNYLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDOUI7S0FDRjtVQUVZLFlBQVk7UUFDRjtRQUFyQixZQUFxQixHQUFXO1lBQVgsUUFBRyxHQUFILEdBQUcsQ0FBUTtTQUFJO1FBRXBDLE1BQU0sSUFBSSxDQUFDLElBQWU7WUFDeEIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUU7Z0JBQzdCLE1BQU0sSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQzthQUN4RDtZQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUMvQixNQUFNLElBQUksU0FBUyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7YUFDM0Q7WUFDRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDN0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzFCLE1BQU0sSUFBSSxTQUFTLENBQUMsK0JBQStCLENBQUMsQ0FBQzthQUN0RDtZQUVELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ3pFO0tBQ0Y7QUFFZ0JDLDBCQTREaEI7SUE1REQsV0FBaUIsSUFBSTtRQU1uQixNQUFhLElBQUk7WUFDZixNQUFNLENBQVU7WUFDaEIsU0FBUyxDQUFZO1lBQ3JCLE9BQU8sQ0FBVztZQUNsQixFQUFFLENBQVk7WUFDZCxHQUFHLENBQVk7WUFDZixPQUFPLENBQVM7WUFDaEIsSUFBSSxDQUFTO1lBRWI7Z0JBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO2dCQUNiLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO2dCQUNkLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUNoQjtZQUVELFNBQVMsQ0FBQyxJQUFZLEVBQUUsT0FBZSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsWUFBWSxDQUFDLElBQVksRUFBRSxPQUFlLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ3BDLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxVQUFVLENBQUMsSUFBWSxFQUFFLE9BQWUsRUFBRTtnQkFDeEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztnQkFDOUIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELEtBQUssQ0FBQyxJQUFZLEVBQUUsT0FBZSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUM3QixPQUFPLElBQUksQ0FBQzthQUNiO1lBRUQsTUFBTSxDQUFDLElBQVksRUFBRSxPQUFlLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxVQUFVLENBQUMsT0FBZTtnQkFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7Z0JBQ3ZCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxPQUFPLENBQUMsSUFBWTtnQkFDbEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLE9BQU8sSUFBSSxDQUFDO2FBQ2I7U0FDRjtRQXJEWSxTQUFJLE9BcURoQixDQUFBO0lBQ0gsQ0FBQyxFQTVEZ0JBLFlBQUksS0FBSkEsWUFBSTs7VUNsQ1IsZ0JBQWdCO1FBQ2xCLGNBQWMsQ0FBc0I7UUFDcEMsT0FBTyxDQUFlO1FBRXRCLE1BQU0sQ0FBYztRQUU3QjtZQUNFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUVsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7U0FDakM7S0FDRjtVQUVZLGlCQUFrQixTQUFRLGVBQWU7UUFDM0MsTUFBTSxDQUFtQjtRQUVsQztZQUNFLEtBQUssRUFBRSxDQUFDO1lBRVIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7U0FDdEM7OztVQ1pVLGFBQWE7UUFDZixjQUFjLENBQXNCO1FBQ3BDLE9BQU8sQ0FBZTtRQUV0QixVQUFVLENBQWE7UUFDdkIsWUFBWSxDQUFxQjtRQUNqQyxJQUFJLENBQWE7UUFDakIsV0FBVyxDQUFvQjtRQUMvQixRQUFRLENBQWlCO1FBQ3pCLElBQUksQ0FBYTtRQUUxQjtZQUNFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1lBQ2hELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUVsQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksU0FBUyxFQUFFLENBQUM7U0FDN0I7S0FDRjtVQUVZLGNBQWUsU0FBUSxlQUFlO1FBQ3hDLE1BQU0sQ0FBZ0I7UUFFL0I7WUFDRSxLQUFLLEVBQUUsQ0FBQztZQUVSLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztTQUNuQzs7O1VDM0NVLE9BQU87UUFDbEIsYUFBYSxJQUFJO1lBQ2YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQzlDO1FBRUQsYUFBYSxNQUFNLENBQUMsR0FBUTtZQUMxQixJQUFJLEdBQUcsWUFBWSxLQUFLLEVBQUU7Z0JBQ3hCLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUM1QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDakU7aUJBQU0sSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7Z0JBQ2xDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ3JGO2lCQUFNO2dCQUNMLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQzthQUMxRjtTQUNGO1FBRUQsYUFBYSxRQUFRO1lBQ25CLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLGFBQWEsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQ3BGLHNCQUFzQixDQUN2QixDQUFDO1lBQ0YsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQy9FO0tBQ0Y7VUFFWSxZQUFhLFNBQVEsS0FBSztRQUNyQyxzQkFBc0IsQ0FBUztRQUMvQixhQUFhLENBQVM7UUFFdEIsWUFDRSxJQUFZLEVBQ1osT0FBZSxFQUNmLHNCQUE4QixFQUM5QixhQUFxQjtZQUVyQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNqQixJQUFJLENBQUMsc0JBQXNCLEdBQUcsc0JBQXNCLENBQUM7WUFDckQsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7U0FDcEM7OztJQzVCSSxlQUFlLEtBQUssTUFBSztVQUVuQixZQUFhLFNBQVEsS0FBSztRQUNyQyxZQUFZLE9BQWdCO1lBQzFCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7U0FDbkM7S0FDRjtVQUVZLE9BQU87UUFDbEIsUUFBUSxDQUFJO1FBQ1osSUFBSSxDQUFVO1FBQ2QsS0FBSyxDQUFPO1FBQ1osYUFBYSxDQUFlO1FBRTVCLFlBQVksT0FBVTtZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztTQUM1QjtRQUVELFlBQVksQ0FBQyxJQUFVO1lBQ3JCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7Z0JBQ3hCLE1BQU0sSUFBSSxZQUFZLENBQUMsNEJBQTRCLENBQUMsQ0FBQzthQUN0RDtZQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ25CO1FBRUQsb0JBQW9CLENBQUMsWUFBMEI7WUFDN0MsSUFBSSxJQUFJLENBQUMsYUFBYSxLQUFLLEtBQUssRUFBRTtnQkFDaEMsTUFBTSxJQUFJLFlBQVksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO2FBQy9EO1lBQ0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7U0FDbkM7UUFFRCxJQUFJLE9BQU87WUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDdEI7UUFFRCxNQUFNLEdBQUc7WUFDUCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2IsTUFBTSxJQUFJLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQzVDO1lBRUQsSUFDRSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUs7Z0JBQ3BCLElBQUksQ0FBQyxhQUFhLEtBQUssS0FBSztnQkFDNUIsVUFBVSxDQUFDLEdBQUcsWUFBWSxRQUFRO2dCQUNsQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUMzQixVQUFVLENBQUMsV0FBVyxZQUFZLFFBQVE7Z0JBQzFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDbkM7Z0JBQ0EsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN0RCxJQUFJLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDdkU7WUFFRCxJQUFJLE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFO2dCQUN4QixJQUFJO29CQUNGLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2lCQUNwQjtnQkFBQyxPQUFPLEtBQUssRUFBRTtvQkFDZCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUN0QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztpQkFDcEQ7YUFDRjtpQkFBTTtnQkFDTCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzthQUNwRDtTQUNGOzs7SUNsREgsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7UUFDeEIsaUJBQWlCO1FBQ2pCLGNBQWM7S0FDZixDQUFDLENBQUM7QUFFUUMsNkJBQXFEO2FBRWhELFlBQVk7UUFDMUIsTUFBTSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNyQ0EsZUFBTyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7YUFFZSxlQUFlO1FBQzdCLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQWlCLEVBQUUsQ0FBQztRQUN4Q0EsZUFBTyxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pDOzs7Ozs7Ozs7OzsifQ==
