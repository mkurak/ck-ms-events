import { Service, ServiceContainer, IServiceContainer } from 'ck-ms-di';

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

@Service({ name: 'EventContainer', lifecycle: 'singleton' })
export class EventContainer {
    private serviceContainer?: IServiceContainer;
    private events: Map<string, EventModel> = new Map();

    constructor(serviceContainer?: ServiceContainer) {
        this.serviceContainer = serviceContainer;
    }

    public addEvent(eventModel: EventModel): void {
        if (!eventModel.event || eventModel.event === '') {
            throw new Error('Event name is required');
        }

        if (this.events.has(eventModel.event)) {
            throw new Error('Event already exists');
        }

        this.events.set(eventModel.event, eventModel);
    }

    public getEvent(eventName: string): EventModel | undefined {
        return this.events.get(eventName);
    }

    public addSubscriber(eventName: string, subscriber: Subscriber): void {
        if (!this.events.has(eventName)) {
            const newEvent = {
                event: eventName,
                subscribers: [subscriber],
            } as EventModel;

            this.addEvent(newEvent);

            return;
        }

        const event: EventModel = this.getEvent(eventName) as EventModel;

        if (event.subscribers.some((sub) => sub.callbackAsync === subscriber.callbackAsync)) {
            throw new Error('Subscriber already exists');
        }

        subscriber.order = subscriber.order ?? event.subscribers.length + 1;

        event.subscribers.push(subscriber);

        event.subscribers = event.subscribers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    public async triggerAsync(eventName: string, payload: HandlerResponse, sessionId?: string): Promise<HandlerResponse> {
        const event: EventModel | undefined = this.getEvent(eventName);

        if (!event) {
            this.addEvent({
                event: eventName,
                subscribers: [],
            });
        } else {
            if (this.serviceContainer && !sessionId) {
                sessionId = this.serviceContainer.beginSession();
            }

            sessionId = this.serviceContainer?.beginSession();

            payload.sessionId = sessionId;

            for (const subscriber of event.subscribers) {
                await subscriber.callbackAsync(payload);

                if (payload.stopProcessing) {
                    if (!payload.error) {
                        payload.error = {
                            message: 'Event processing stopped',
                            key: 'EVENT_PROCESSING_STOPPED',
                            stack: null,
                            meta: null,
                        };
                    }
                    break;
                }
            }

            if (this.serviceContainer && sessionId) {
                this.serviceContainer.endSession(sessionId);
            }
        }

        return payload;
    }

    public get eventsList(): readonly EventModel[] {
        return Object.freeze([...this.events.values()]);
    }

    public getSubscriber(eventName: string, order?: number | null): Subscriber | undefined {
        const event = this.getEvent(eventName);
        if (event) {
            return event.subscribers.find((sub) => {
                if (!order) {
                    return true;
                }

                return sub.order === order;
            });
        }
        return undefined;
    }

    public removeSubscriber(eventName: string, order: number): void {
        const event = this.getEvent(eventName);
        if (event) {
            event.subscribers = event.subscribers.filter((sub) => sub.order !== order);

            event.subscribers = event.subscribers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }
    }

    public removeEvent(eventName: string): void {
        this.events.delete(eventName);
    }

    public clear(): void {
        this.events.clear();
    }
}
