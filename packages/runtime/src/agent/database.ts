export class DatabaseClientId {
  constructor(readonly dataSourceId: string, readonly connectionId: string) {}
}

export class DatabaseAgent {
  async connect({
    databaseDriver,
    connectionString = null,
    connection = null,
  }: Database.Config): Promise<DatabaseClient> {
    let connectionParameters;

    if (typeof connectionString === "string") {
      connectionParameters = { plainConnectionString: connectionString };
    } else {
      if (typeof connection === "string") {
        connectionParameters = { plainConnectionString: connection };
      } else if (connection instanceof Database.MssqlParameters) {
        connectionParameters = { mssql: connection };
      } else if (connection instanceof Database.MySqlParameters) {
        connectionParameters = { mySql: connection };
      } else if (connection instanceof Database.OracleParameters) {
        connectionParameters = { oracle: connection };
      } else if (connection instanceof Database.PostgresParameters) {
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
export class DatabaseClient {
  constructor(readonly uid: DatabaseClientId) {}

  async query(rawSql: string, params: any[]): Promise<Database.QueryResults> {
    interface QueryResults {
      columns: Database.QueryResultColumn[];
      rows: any[];
    }

    let results: QueryResults = await Deno.core.opAsync(
      "op_database_agent_query",
      {
        uid: this.uid,
        rawSql,
        params,
      }
    );

    results.rows = results.rows.reduce((newRows: any[], row: any) => {
      type Row = { [key: string]: any };
      let newRow: Row = {};
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

  async disconnect(): Promise<void> {
    await Deno.core.opAsync("op_database_agent_disconnect", this.uid);
  }

  async execute(rawSql: string, params: any[]) {
    return Deno.core.opAsync("op_database_agent_execute", {
      uid: this.uid,
      rawSql,
      params,
    });
  }

  async beginTransaction(): Promise<DatabaseClient> {
    await Deno.core.opAsync("op_database_agent_begin_transaction", this.uid);
    return this;
  }

  async commitTransaction(): Promise<void> {
    await Deno.core.opAsync("op_database_agent_commit_transaction", this.uid);
  }

  async rollbackTransaction(): Promise<void> {
    await Deno.core.opAsync("op_database_agent_rollback_transaction", this.uid);
  }
}

export namespace Database {
  export interface Config {
    databaseDriver: Driver;
    connectionString?: string | null;
    connection?:
      | string
      | MySqlParameters
      | OracleParameters
      | PostgresParameters
      | null;
  }

  export enum Driver {
    Postgres = "Postgres",
    MySql = "MySQL",
    Mssql = "MSSQL",
    Db2 = "Db2",
    Oracle = "Oracle",
    Snowflake = "Snowflake",
  }

  export interface IMssqlParameters {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    trustCert?: boolean;
    instanceName?: string;
  }
  export class MssqlParameters {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly username: string;
    readonly password: string;
    readonly trustCert?: boolean;
    readonly instanceName?: string;

    constructor(parameters?: IMssqlParameters) {
      this.host = parameters?.host ?? "localhost";
      this.port = parameters?.port ?? 1433;
      this.database = parameters?.database ?? "";
      this.username = parameters?.username ?? "";
      this.password = parameters?.password ?? "";
      this.trustCert = parameters?.trustCert;
      this.instanceName = parameters?.instanceName;
    }
  }

  export interface IMySqlParameters {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  }
  export class MySqlParameters {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly username: string;
    readonly password: string;

    constructor(parameters?: IMySqlParameters) {
      this.host = parameters?.host ?? "localhost";
      this.port = parameters?.port ?? 3306;
      this.database = parameters?.database ?? "";
      this.username = parameters?.username ?? "";
      this.password = parameters?.password ?? "";
    }
  }

  export interface IOracleParameters {
    host: string;
    port: number;
    serviceName: string;
    username: string;
    password: string;
    integratedSecurity: boolean;
    extraParams?: Record<string, string>;
  }
  export class OracleParameters {
    readonly host: string;
    readonly port: number;
    readonly serviceName: string;
    readonly username: string;
    readonly password: string;
    readonly integratedSecurity: boolean;
    readonly extraParams?: Record<string, string>;

    constructor(parameters?: IOracleParameters) {
      this.host = parameters?.host ?? "localhost";
      this.port = parameters?.port ?? 1521;
      this.serviceName = parameters?.serviceName ?? "";
      this.username = parameters?.username ?? "";
      this.password = parameters?.password ?? "";
      this.integratedSecurity = parameters?.integratedSecurity ?? false;
      this.extraParams = parameters?.extraParams ?? {};
    }
  }

  export interface IPostgresParameters {
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
  export class PostgresParameters {
    readonly host: string;
    readonly port: number;
    readonly database: string;
    readonly username: string;
    readonly password: string;
    readonly options?: string;
    readonly connectTimeout?: number;
    readonly keepalives?: boolean;
    readonly keepalivesIdle?: number;

    constructor(parameters?: IPostgresParameters) {
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

  export interface QueryResultColumn {
    name: string;
    type: string;
  }

  export interface QueryResults {
    columns: QueryResultColumn[];
    rows: { [key: string]: any }[];
  }
}
