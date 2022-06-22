import { GenericLogic, Logic, RailwayError } from "@saffron/logic";

@Logic()
export class TestEvent extends GenericLogic {
  async run() {
    this.context.agents.logging.info("test TestEvent");

    await this.context.agents.eventStore.emit([
      {
        labelName: "labelName",
        sourceDigitalIdentity: "sourceDigitalIdentity",
        targetDigitalIdentity: "targetDigitalIdentity",
        meta: "meta 0000",
        type: "default",
      },
    ]);

    await this.context.agents.eventStore.emit([
      {
        labelName: "labelName",
        sourceDID: "sourceDID",
        targetDID: "targetDID",
        meta: "meta 0001",
        type: "default",
      },
      {
        labelName: "labelName",
        sourceDigitalIdentity: "sourceDigitalIdentity",
        targetDID: "targetDID",
        meta: "meta 0002",
        type: "default",
      },
      {
        labelName: "labelName",
        sourceDID: "sourceDID",
        targetDigitalIdentity: "targetDigitalIdentity",
        meta: "meta 0003",
        type: "default",
      },
      {
        labelName: "labelName",
        sourceDID: "sourceDID",
        sourceDigitalIdentity: "sourceDigitalIdentity",
        targetDID: "targetDID",
        targetDigitalIdentity: "targetDigitalIdentity",
        meta: "meta 0004",
        type: "default",
      },
    ]);

    {
      const searchReq = {
        queries: [
          {
            Match: {
              field: "source_digital_identity",
              value: "b184ad67-448b-47ae-84aa-9cd97705e5b7",
            },
          },
        ],
        excludes: [],
        filters: [],
        from: 0,
        size: 0,
        sorts: [],
      };
      await this.context.agents.eventStore.search(searchReq);
    }

    {
      const patternReq = {
        sequences: [
          {
            conditions: [
              {
                Eq: {
                  field: "source_digital_identity",
                  value: "b184ad67-448b-47ae-84aa-9cd97705e5b7",
                },
              },
              {
                NotEq: {
                  field: "label_id",
                  value: "label_3",
                },
              },
            ],
            sharedFields: [],
            type: "",
          },
          {
            conditions: [
              {
                Eq: {
                  field: "source_digital_identity",
                  value: "c700f07f-920f-4be8-aa52-c8c42e1578de",
                },
              },
            ],
            sharedFields: [],
            type: "",
          },
        ],
        filter: {
          Range: {
            field: "timestamp",
            value: {
              lte: 1625122259000,
              gte: 1625124173000,
            },
          },
        },
      };
      await this.context.agents.eventStore.searchWithPattern(patternReq);
    }
  }

  async handleError(error: RailwayError) {
    this.context.agents.logging.error(`${error}`);
  }
}
