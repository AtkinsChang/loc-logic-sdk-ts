import { Database, GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestDatabase extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestDatabase");

    await this.testQuery();
    await this.testExecute();
  }

  async testQuery() {
    try {
      let connection = new Database.OracleParameters({
        host: "db.fst.network",
        port: 1521,
        serviceName: "ORCLCDB",
        username: "user",
        password: "password",
        integratedSecurity: false,
      });
      let db = await this.context.agents.database?.connect({
        databaseDriver: Database.Driver.Oracle,
        connection,
      });
      let resp = await db?.query(
        "SELECT * FROM saffron_process.tables WHERE 1=1;",
        []
      );
      if (resp !== undefined) {
        await this.context.agents.sessionStorage.putJson(
          "database_test_query_resp_columns",
          resp?.columns
        );
        await this.context.agents.sessionStorage.putJson(
          "database_test_query_resp_rows",
          resp?.rows
        );
      }
    } catch (error) {
      await this.context.agents.sessionStorage.putString(
        "database_test_query_error",
        `Failed to query SQL on Database: ${error}`
      );
    }
  }

  async testExecute() {
    try {
      let db = await this.context.agents.database?.connect({
        databaseDriver: Database.Driver.Oracle,
        connectionString: "DatabaseConnectionString",
      });

      await db?.beginTransaction();
      let resp = await db?.execute(
        "INSERT INTO saffron_process.tables(id, name) VALUES ($1, $2);",
        [4, "usada"]
      );
      await this.context.agents.sessionStorage.putJson(
        "database_test_execute_resp",
        resp
      );
      await db?.commitTransaction();
      await db?.disconnect();
    } catch (error) {
      await this.context.agents.sessionStorage.putString(
        "database_test_execute_error",
        `Failed to execute SQL on Database: ${error}`
      );
    }
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
