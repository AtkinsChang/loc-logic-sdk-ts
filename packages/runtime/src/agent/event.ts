import {
  PatternRequest,
  PatternResponse,
  SearchRequest,
  SearchResponse,
} from "../types/event";

export class EventAgent {
  async emit(events: Event.Event[]): Promise<void> {
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

  async search(request: SearchRequest): Promise<SearchResponse> {
    return Deno.core.opAsync("op_event_agent_search", request);
  }

  async searchWithPattern(request: PatternRequest): Promise<PatternResponse> {
    return Deno.core.opAsync("op_event_agent_search_with_pattern", request);
  }
}

export namespace Event {
  export interface Event {
    labelName: string;
    sourceDigitalIdentity?: string;
    targetDigitalIdentity?: string;
    sourceDID?: string; // sourceDID is an alias of sourceDigitalIdentity
    targetDID?: string; // targetDID is an alias of targetDigitalIdentity
    meta: string;
    type: string;
  }

  export interface EventArgs {
    labelName: string;
    sourceDigitalIdentity: string;
    targetDigitalIdentity: string;
    meta: string;
    type: string;
  }
}
