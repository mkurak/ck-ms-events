import { ServiceContainer } from 'ck-ms-di';
export interface HandlerError {
    message: string;
    key: string;
    stack: string | null;
    meta: object | null;
}
export interface HandlerResponse {
    data: any | null;
    result: any;
    error: HandlerError | null;
    stopProcessing: boolean;
    sessionId?: string;
}
export interface Subscriber {
    callbackAsync: (payload: HandlerResponse) => Promise<void>;
    order: number | null;
}
export interface EventModel {
    event: string;
    subscribers: Subscriber[];
}
export declare class EventContainer {
    private serviceContainer?;
    private events;
    constructor(serviceContainer?: ServiceContainer);
    addEvent(eventModel: EventModel): void;
    getEvent(eventName: string): EventModel | undefined;
    addSubscriber(eventName: string, subscriber: Subscriber): void;
    triggerAsync(eventName: string, payload: HandlerResponse, sessionId?: string): Promise<HandlerResponse>;
    get eventsList(): readonly EventModel[];
    getSubscriber(eventName: string, order?: number | null): Subscriber | undefined;
    removeSubscriber(eventName: string, order: number): void;
    removeEvent(eventName: string): void;
    clear(): void;
}
//# sourceMappingURL=EventContainer.d.ts.map