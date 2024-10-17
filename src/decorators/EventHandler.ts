import 'reflect-metadata';
import { ServiceContainer } from 'ck-ms-di';
import { EventContainer, Subscriber } from '../EventContainer';

export interface EventHandlerOptions {
    event: string;
    order?: number;
}

export function EventHandler(options: EventHandlerOptions) {
    return function (target: any, propertyKey: any, descriptor?: PropertyDescriptor) {
        (async () => {
            const services = ServiceContainer.getInstance();
            const events = await services.resolveAsync<EventContainer>(EventContainer);

            events?.addSubscriber(options.event, {
                callbackAsync: descriptor?.value ?? target[propertyKey],
            } as Subscriber);
        })();
    };
}
