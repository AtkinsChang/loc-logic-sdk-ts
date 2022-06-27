declare class Railway {
  static isOk(): Promise<boolean>;
  static switch(err: any): Promise<void>;
  static getError(): Promise<RailwayError>;
}
declare class RailwayError extends Error {
  logicPermanentIdentity: string;
  logicRevision: number;
  constructor(
    name: string,
    message: string,
    logicPermanentIdentity: string,
    logicRevision: number
  );
}

declare type Source =
  | {
      Terms: TermsProps;
    }
  | {
      DateHistogram: DateProps;
    };
declare type OrderBy = "Asc" | "Desc";
declare type Condition =
  | {
      Eq: QueryMap;
    }
  | {
      NotEq: QueryMap;
    }
  | {
      Gt: QueryMap;
    }
  | {
      Lt: QueryMap;
    }
  | {
      Gte: QueryMap;
    }
  | {
      Lte: QueryMap;
    };
declare type Filter =
  | {
      Range: FilterMap;
    }
  | {
      Wildcard: QueryMap;
    };
declare type Query =
  | {
      Match: QueryMap;
    }
  | {
      Term: QueryMap;
    }
  | {
      MatchPhrase: QueryMap;
    };
interface Aggregation {
  after: {
    [k: string]: string;
  };
  queries: AggregationSource[];
  size?: number | null;
  [k: string]: unknown;
}
interface AggregationSource {
  field: string;
  value: Source;
  [k: string]: unknown;
}
interface TermsProps {
  field: string;
  orderBy: OrderBy;
  [k: string]: unknown;
}
interface DateProps {
  field: string;
  fixedInterval: string;
  format: string;
  orderBy: OrderBy;
  [k: string]: unknown;
}
interface AggregationResponse {
  after: {
    [k: string]: string;
  };
  buckets: Bucket[];
  [k: string]: unknown;
}
interface Bucket {
  docCount: number;
  key: {
    [k: string]: string;
  };
  [k: string]: unknown;
}
interface QueryMap {
  field: string;
  value: string;
  [k: string]: unknown;
}
interface Duration {
  nanos: number;
  secs: number;
  [k: string]: unknown;
}
interface Event1 {
  dataProcessIdentityContext: IdentityContext;
  executionId: string;
  label: Label;
  logicIdentityContext: IdentityContext;
  meta: string;
  sequence: number;
  sourceDigitalIdentity: string;
  targetDigitalIdentity: string;
  taskId: string;
  timestamp: string;
  type: string;
  [k: string]: unknown;
}
interface IdentityContext {
  name: string;
  permanentIdentity: string;
  revision: number;
  [k: string]: unknown;
}
interface Label {
  id: string;
  name: string;
  [k: string]: unknown;
}
interface FilterMap {
  field: string;
  value: FilterProps;
  [k: string]: unknown;
}
interface FilterProps {
  gte?: number | null;
  lte?: number | null;
  [k: string]: unknown;
}
interface PatternRequest {
  filter?: Filter | null;
  maxSpan?: Duration | null;
  sequences: SequenceEvent[];
  [k: string]: unknown;
}
interface SequenceEvent {
  conditions: Condition[];
  sharedFields: string[];
  type: string;
  [k: string]: unknown;
}
interface PatternResponse {
  count: number;
  sequences: SequencesResult[];
  took: number;
  total: number;
  [k: string]: unknown;
}
interface SequencesResult {
  events: Event1[];
  joinKeys: string[];
  [k: string]: unknown;
}
interface SearchRequest {
  aggregation?: Aggregation | null;
  excludes: Query[];
  filters: Filter[];
  from: number;
  queries: Query[];
  size: number;
  sorts: Sort[];
  [k: string]: unknown;
}
interface Sort {
  field: string;
  orderBy: OrderBy;
  [k: string]: unknown;
}
interface SearchResponse {
  aggregation?: AggregationResponse | null;
  count: number;
  events: Event1[];
  took: number;
  total: number;
  [k: string]: unknown;
}

interface Task {
  executionId: string;
  taskId: string;
  startAt: Date;
  dataProcess: IdentityContext;
  currentLogic?: IdentityContext;
  executedLogics: Array<IdentityContext>;
}

declare type Payload =
  | {
      http: HttpPayload;
    }
  | {
      messageQueue: MessageQueuePayload;
    }
  | {
      event: EventPayload;
    };
declare type Subscriber = {
  kafka: KafkaSubscriber;
};
interface HttpPayload {
  apiGatewayIdentityContext: DataSourceIdentityContext;
  apiIdentityContext: DataSourceIdentityContext;
  body: number[];
  headers: {
    [k: string]: unknown;
  };
  host: string;
  method: string;
  path: string;
  query: string;
  requestId: string;
  scheme: string;
  version: "HTTP/0.9" | "HTTP/1.0" | "HTTP/1.1" | "HTTP/2.0" | "HTTP/3.0";
  [k: string]: unknown;
}
interface DataSourceIdentityContext {
  id: string;
  name: string;
  [k: string]: unknown;
}
interface MessageQueuePayload {
  clientIdentityContext: DataSourceIdentityContext;
  data: number[];
  subscriber: Subscriber;
  [k: string]: unknown;
}
interface KafkaSubscriber {
  brokers: string[];
  groupId: string;
  offset: number;
  partition: number;
  topic: string;
  [k: string]: unknown;
}
interface EventPayload {
  [k: string]: unknown;
}

declare abstract class AbstractContext {
  readonly payload: Payload;
  readonly task: Task;
  constructor();
}

declare class DatabaseClientId {
  readonly dataSourceId: string;
  readonly connectionId: string;
  constructor(dataSourceId: string, connectionId: string);
}
declare class DatabaseAgent {
  connect({
    databaseDriver,
    connectionString,
    connection,
  }: Database.Config): Promise<DatabaseClient>;
}
declare class DatabaseClient {
  readonly uid: DatabaseClientId;
  constructor(uid: DatabaseClientId);
  query(rawSql: string, params: any[]): Promise<Database.QueryResults>;
  disconnect(): Promise<void>;
  execute(rawSql: string, params: any[]): Promise<any>;
  beginTransaction(): Promise<DatabaseClient>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}
declare namespace Database {
  interface Config {
    databaseDriver: Driver;
    connectionString?: string | null;
    connection?:
      | string
      | MySqlParameters
      | OracleParameters
      | PostgresParameters
      | null;
  }
  enum Driver {
    Postgres = "Postgres",
    MySql = "MySQL",
    Mssql = "MSSQL",
    Db2 = "Db2",
    Oracle = "Oracle",
    Snowflake = "Snowflake",
  }
  interface IMssqlParameters {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    trustCert?: boolean;
    instanceName?: string;
  }
  class MssqlParameters {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly username: string;
    readonly password: string;
    readonly trustCert?: boolean;
    readonly instanceName?: string;
    constructor(parameters?: IMssqlParameters);
  }
  interface IMySqlParameters {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  }
  class MySqlParameters {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly username: string;
    readonly password: string;
    constructor(parameters?: IMySqlParameters);
  }
  interface IOracleParameters {
    host: string;
    port: number;
    serviceName: string;
    username: string;
    password: string;
    integratedSecurity: boolean;
    extraParams?: Record<string, string>;
  }
  class OracleParameters {
    readonly host: string;
    readonly port: number;
    readonly serviceName: string;
    readonly username: string;
    readonly password: string;
    readonly integratedSecurity: boolean;
    readonly extraParams?: Record<string, string>;
    constructor(parameters?: IOracleParameters);
  }
  interface IPostgresParameters {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    options?: string;
    connectTimeout?: number;
    keepalives?: boolean;
    keepalivesIdle?: number;
  }
  class PostgresParameters {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly username: string;
    readonly password: string;
    readonly options?: string;
    readonly connectTimeout?: number;
    readonly keepalives?: boolean;
    readonly keepalivesIdle?: number;
    constructor(parameters?: IPostgresParameters);
  }
  interface QueryResultColumn {
    name: string;
    type: string;
  }
  interface QueryResults {
    columns: QueryResultColumn[];
    rows: {
      [key: string]: any;
    }[];
  }
}

declare class EventAgent {
  emit(events: Event.Event[]): Promise<void>;
  search(request: SearchRequest): Promise<SearchResponse>;
  searchWithPattern(request: PatternRequest): Promise<PatternResponse>;
}
declare namespace Event {
  interface Event {
    labelName: string;
    sourceDigitalIdentity?: string;
    targetDigitalIdentity?: string;
    sourceDID?: string;
    targetDID?: string;
    meta: string;
    type: string;
  }
  interface EventArgs {
    labelName: string;
    sourceDigitalIdentity: string;
    targetDigitalIdentity: string;
    meta: string;
    type: string;
  }
}

declare class FileStorageAgent {
  simpleGet(url: URL | string): Promise<Uint8Array>;
  simplePut(
    url: URL | string,
    data: Uint8Array | string,
    options?: FileStorage.PutOptions
  ): Promise<number>;
  delete(url: URL | string): Promise<void>;
  list(url: URL | string): Promise<Array<FileStorage.FileType>>;
  createDirAll(url: URL | string): Promise<void>;
}
declare namespace FileStorage {
  interface FileType {
    type: "file" | "directory" | "symbolicLink";
    name: string;
  }
  interface PutOptions {
    ensureDir?: boolean;
  }
}

declare class HttpAgent {
  send(
    request: Http.Request,
    config: Http.Config | null
  ): Promise<Http.Response>;
  get(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body?: Uint8Array | null,
    config?: Http.Config | null
  ): Promise<Http.Response>;
  post(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config?: Http.Config | null
  ): Promise<Http.Response>;
  patch(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config?: Http.Config | null
  ): Promise<Http.Response>;
  put(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config?: Http.Config | null
  ): Promise<Http.Response>;
  delete(
    url: string,
    headers: Record<string, string>,
    contentType: Http.ContentType,
    body: Uint8Array | null,
    config?: Http.Config | null
  ): Promise<Http.Response>;
}
declare namespace Http {
  enum Method {
    GET = "Get",
    POST = "Post",
    PATCH = "Patch",
    PUT = "Put",
    DELETE = "Delete",
  }
  enum ContentType {
    None = "None",
    PlantText = "PlantText",
    Json = "Json",
    Form = "Form",
  }
  class Request {
    method: Method;
    url: String;
    headers: Record<string, string>;
    contentType: ContentType;
    body: Uint8Array | null;
    constructor(
      method?: Method,
      url?: string,
      headers?: Record<string, string>,
      contentType?: ContentType,
      body?: Uint8Array | null
    );
    setJson(body: any): this;
    setForm(body: any): this;
  }
  class Config {
    acceptInvalidCerts: boolean;
    constructor(acceptInvalidCerts?: boolean);
  }
  interface Response {
    status: number;
    headers: Record<string, string>;
    body: Uint8Array;
  }
}

declare class LocalStorageAgent {
  get(key: string): Promise<any>;
  putString(key: string, value: string, timeout?: number): Promise<void>;
  putByteArray(
    key: string,
    value: Uint8Array | string,
    timeout?: number
  ): Promise<void>;
  putJson(key: string, value: object, timeout?: number): Promise<void>;
  delete(key: string): Promise<void>;
  remove(key: string): Promise<void>;
}

declare class LoggingAgent {
  trace(value: string | object): void;
  debug(value: string | object): void;
  info(value: string | object): void;
  warn(value: string | object): void;
  error(value: string | object): void;
  log(level: string, value: string | object): void;
}

declare class ResultAgent {
  finalize(value: object): void;
}

declare class SessionStorageAgent {
  get(key: string): Promise<string | number | object | Uint8Array>;
  putJson(key: string, value: any): Promise<boolean>;
  putString(key: string, value: string): Promise<boolean>;
  putByteArray(key: string, value: Uint8Array | string): Promise<boolean>;
  delete(key: string): Promise<void>;
  remove(key: string): Promise<void>;
}

declare class SmtpAgent {
  connect(
    host: string,
    username?: string,
    password?: string
  ): Promise<SmtpAgentHub>;
}
declare class SmtpAgentHub {
  readonly uid: string;
  constructor(uid: string);
  send(mail: Smtp.Mail): Promise<any>;
}
declare namespace Smtp {
  interface MailBox {
    name: string;
    mail: string;
  }
  class Mail {
    sender: MailBox;
    receivers: MailBox[];
    replyTo?: MailBox;
    cc: MailBox[];
    bcc: MailBox[];
    subject: string;
    body: string;
    constructor();
    setSender(mail: string, name?: string): this;
    setReceivers(mail: string, name?: string): this;
    setReplyTo(mail: string, name?: string): this;
    setCC(mail: string, name?: string): this;
    setBCC(mail: string, name?: string): this;
    setSubject(subject: string): this;
    setBody(body: string): this;
  }
}

declare class AggregatorAgents {
  readonly sessionStorage: SessionStorageAgent;
  readonly logging: LoggingAgent;
  readonly result: ResultAgent;
  constructor();
}
declare class AggregatorContext extends AbstractContext {
  readonly agents: AggregatorAgents;
  constructor();
}

declare class GenericAgents {
  readonly sessionStorage: SessionStorageAgent;
  readonly logging: LoggingAgent;
  readonly eventStore: EventAgent;
  readonly localStorage?: LocalStorageAgent;
  readonly http?: HttpAgent;
  readonly fileStorage?: FileStorageAgent;
  readonly database?: DatabaseAgent;
  readonly smtp?: SmtpAgent;
  constructor();
}
declare class GenericContext extends AbstractContext {
  readonly agents: GenericAgents;
  constructor();
}

interface Main {
  (): Promise<void>;
}
interface ErrorHandler {
  (error: RailwayError): Promise<void>;
}
declare class Runtime<C> {
  #private;
  constructor(context: C);
  registerMain(main: Main): void;
  registerErrorHandler(errorHandler: ErrorHandler): void;
  get context(): C;
  run(): Promise<void>;
}
declare global {
  export var run: undefined | (<C>(ctx: C) => Promise<void>);
  export var handleError:
    | undefined
    | (<C>(ctx: C, error: RailwayError) => Promise<void>);
}

declare let runtime: Runtime<AggregatorContext | GenericContext>;
declare function genericLogic(): void;
declare function aggregatorLogic(): void;

export {
  AggregatorContext,
  DataSourceIdentityContext,
  Database,
  DatabaseAgent,
  EventAgent,
  EventPayload,
  FileStorageAgent,
  GenericContext,
  Http,
  HttpAgent,
  HttpPayload,
  IdentityContext,
  LocalStorageAgent,
  LoggingAgent,
  MessageQueuePayload,
  Payload,
  Railway,
  RailwayError,
  ResultAgent,
  SessionStorageAgent,
  Smtp,
  SmtpAgent,
  SmtpAgentHub,
  Task,
  aggregatorLogic,
  genericLogic,
  runtime,
};
