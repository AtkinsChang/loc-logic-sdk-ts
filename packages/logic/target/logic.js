export { Database } from "@saffron/runtime";
export class AbstractLogic {}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxFQUlMLFFBQVEsR0FDVCxNQUFNLGtCQUFrQixDQUFDO0FBRTFCLE1BQU0sT0FBZ0IsYUFBYTtDQUdsQztBQUVELE1BQU0sT0FBZ0IsZUFBZ0IsU0FBUSxhQUFhO0lBQ3pELElBQWMsT0FBTztRQUNuQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBNEIsQ0FBQztJQUN0RCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLE9BQWdCLFlBQWEsU0FBUSxhQUFhO0lBQ3RELElBQWMsT0FBTztRQUNuQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBeUIsQ0FBQztJQUNuRCxDQUFDO0NBQ0Y7QUFFRCxNQUFNLFVBQVUsS0FBSztJQUNuQixPQUFPLENBQUMsTUFBYyxFQUFFLEVBQUU7UUFDeEIsTUFBTSxLQUFLLEdBQUcsSUFBSyxNQUFrQyxFQUFFLENBQUM7UUFDeEQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNwRCxPQUFPLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sVUFBVSxPQUFPO0lBQ3JCLE9BQU8sQ0FBQyxNQUFjLEVBQUUsV0FBNEIsRUFBRSxFQUFFO1FBQ3RELE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRTtZQUN6QyxHQUFHO2dCQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDakMsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQztBQUNKLENBQUMifQ==
