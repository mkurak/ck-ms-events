import 'reflect-metadata';
import { ServiceContainer } from 'ck-ms-di';
import { EventContainer } from '../EventContainer';

export interface EventHandlerOptions {
    event: string;
    order?: number;
}

export function EventHandler(options: EventHandlerOptions) {
    return function (target: any, propertyKey: any, descriptor?: PropertyDescriptor) {
        const services = ServiceContainer.getInstance();
        const events = services.resolve<EventContainer>(EventContainer);
        const event = events.getEvent(options.event);

        events.addSubscriber(options.event, {
            callbackAsync: descriptor?.value ?? target[propertyKey],
            order: options.order ?? (event ? event.subscribers.length + 1 : 1),
        });
    };
}
