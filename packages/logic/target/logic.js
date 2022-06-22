export { Database } from "@saffron/runtime";
export class AbstractLogic {
}
export class AggregatorLogic extends AbstractLogic {
    get context() {
        return Saffron.runtime.context;
    }
}
export class GenericLogic extends AbstractLogic {
    get context() {
        return Saffron.runtime.context;
    }
}
export function Logic() {
    return (target) => {
        const logic = new target();
        Saffron.runtime.registerMain(logic.run.bind(logic));
        Saffron.runtime.registerErrorHandler(logic.handleError.bind(logic));
    };
}
export function Context() {
    return (target, propertyKey) => {
        Object.defineProperty(target, propertyKey, {
            get() {
                return Saffron.runtime.context;
            },
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFrRCxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU1RixNQUFNLE9BQWdCLGFBQWE7Q0FHbEM7QUFFRCxNQUFNLE9BQWdCLGVBQWdCLFNBQVEsYUFBYTtJQUN6RCxJQUFjLE9BQU87UUFDbkIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQTRCLENBQUM7SUFDdEQsQ0FBQztDQUNGO0FBRUQsTUFBTSxPQUFnQixZQUFhLFNBQVEsYUFBYTtJQUN0RCxJQUFjLE9BQU87UUFDbkIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQXlCLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBRUQsTUFBTSxVQUFVLEtBQUs7SUFDbkIsT0FBTyxDQUFDLE1BQWMsRUFBRSxFQUFFO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUssTUFBa0MsRUFBRSxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLFVBQVUsT0FBTztJQUNyQixPQUFPLENBQUMsTUFBYyxFQUFFLFdBQTRCLEVBQUUsRUFBRTtRQUN0RCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUU7WUFDekMsR0FBRztnQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ2pDLENBQUM7U0FDRixDQUFDLENBQUM7SUFDTCxDQUFDLENBQUM7QUFDSixDQUFDIn0=