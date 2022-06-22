import { IdentityContext } from "../types/event";

export interface Task {
  executionId: string;
  taskId: string;
  startAt: Date;
  dataProcess: IdentityContext;
  currentLogic?: IdentityContext;
  executedLogics: Array<IdentityContext>;
}
