import { AggregatorContext, GenericContext, RailwayError } from "@saffron/runtime";
export { EventPayload, MessageQueuePayload, HttpPayload, Database } from "@saffron/runtime";
export declare abstract class AbstractLogic {
    abstract run(): Promise<void>;
    abstract handleError(error: RailwayError): Promise<void>;
}
export declare abstract class AggregatorLogic extends AbstractLogic {
    protected get context(): AggregatorContext;
}
export declare abstract class GenericLogic extends AbstractLogic {
    protected get context(): GenericContext;
}
export declare function Logic(): ClassDecorator;
export declare function Context(): PropertyDecorator;
//# sourceMappingURL=logic.d.ts.map