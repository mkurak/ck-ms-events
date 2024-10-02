import { ServiceContainer } from 'ck-ms-di';
import { EventContainer, HandlerResponse } from '../src/EventContainer';

describe('EventContainer', () => {
    describe('Tests when not used as a service', () => {
        test('An event should be able to be added.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addEvent({ event: 'test', subscribers: [] });
            expect(eventContainer.getEvent('test')).toBeDefined();
        });

        test('Multiple events should be able to be added.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
        });

        test('An event and a subscriber should be able to be added.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test', { callbackAsync: async () => {}, order: 1 });
            expect(eventContainer.getEvent('test')).toBeDefined();
            expect(eventContainer.getEvent('test')?.subscribers.length).toBe(1);
        });

        test('Multiple events and multiple subscribers for each event should be able to be added.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test1')?.subscribers.length).toBe(2);
            expect(eventContainer.getEvent('test2')).toBeDefined();
            expect(eventContainer.getEvent('test2')?.subscribers.length).toBe(2);
        });

        test('Multiple events should be able to be added and then one of them should be able to be removed.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
        });

        test('Multiple events and multiple subscribers for each event should be able to be added and then one of them should be able to be removed.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
        });

        test('Multiple events should be able to be added and then multiple subscribers should be able to be added to each event. Then some of the subscribers should be able to be removed.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            eventContainer.removeSubscriber('test1', 1);
            eventContainer.removeSubscriber('test2', 2);
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test1')?.subscribers.length).toBe(1);
            expect(eventContainer.getEvent('test2')).toBeDefined();
            expect(eventContainer.getEvent('test2')?.subscribers.length).toBe(1);
        });

        test('An event should be able to be added and multiple subscribers should be able to be added to this event. Then the event should be triggered and it should be checked that the subscribers are working.', async () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test', {
                callbackAsync: async (payload: HandlerResponse) => {
                    payload.result = 'test - subscriber1';
                },
                order: 1,
            });
            eventContainer.addSubscriber('test', {
                callbackAsync: async (payload: HandlerResponse) => {
                    payload.result += ' > test - subscriber2';
                },
                order: 2,
            });

            const payload: HandlerResponse = {} as HandlerResponse;
            await eventContainer.triggerAsync('test', payload);

            expect(payload.result).toBe('test - subscriber1 > test - subscriber2');
        });

        test('Performance Test: 1000 events should be added and 1000 subscribers should be added to each event. Then all events should be triggered at the same time and it should be checked that the subscribers are working.', async () => {
            const eventContainer = new EventContainer();
            for (let i = 0; i < 1000; i++) {
                eventContainer.addSubscriber(`test${i}`, {
                    callbackAsync: async (payload: HandlerResponse) => {
                        payload.result = `test${i} - subscriber1`;
                    },
                    order: 1,
                });
                eventContainer.addSubscriber(`test${i}`, {
                    callbackAsync: async (payload: HandlerResponse) => {
                        payload.result += ` > test${i} - subscriber2`;
                    },
                    order: 2,
                });
            }

            const payload: HandlerResponse = {} as HandlerResponse;
            for (let i = 0; i < 1000; i++) {
                await eventContainer.triggerAsync(`test${i}`, payload);
            }

            expect(payload.result).toBe(`test999 - subscriber1 > test999 - subscriber2`);
        }, 10000);
    });

    describe('Tests when used as a service', () => {
        test('An event should be able to be added.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addEvent({ event: 'test', subscribers: [] });
            expect(eventContainer.getEvent('test')).toBeDefined();
            eventContainer.clear();
        });

        test('Multiple events should be able to be added.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
            eventContainer.clear();
        });

        test('An event and a subscriber should be able to be added.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addSubscriber('test', { callbackAsync: async () => {}, order: 1 });
            expect(eventContainer.getEvent('test')).toBeDefined();
            expect(eventContainer.getEvent('test')?.subscribers.length).toBe(1);
            eventContainer.clear();
        });

        test('Multiple events and multiple subscribers for each event should be able to be added.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test1')?.subscribers.length).toBe(2);
            expect(eventContainer.getEvent('test2')).toBeDefined();
            expect(eventContainer.getEvent('test2')?.subscribers.length).toBe(2);
            eventContainer.clear();
        });

        test('Multiple events should be able to be added and then one of them should be able to be removed.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
            eventContainer.clear();
        });

        test('Multiple events and multiple subscribers for each event should be able to be added and then one of them should be able to be removed.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
            eventContainer.clear();
        });

        test('Multiple events should be able to be added and then multiple subscribers should be able to be added to each event. Then some of the subscribers should be able to be removed.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            eventContainer.removeSubscriber('test1', 1);
            eventContainer.removeSubscriber('test2', 2);
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test1')?.subscribers.length).toBe(1);
            expect(eventContainer.getEvent('test2')).toBeDefined();
            expect(eventContainer.getEvent('test2')?.subscribers.length).toBe(1);
            eventContainer.clear();
        });

        test('An event should be able to be added and multiple subscribers should be able to be added to this event. Then the event should be triggered and it should be checked that the subscribers are working.', async () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addSubscriber('test', {
                callbackAsync: async (payload: HandlerResponse) => {
                    payload.result = 'test - subscriber1';
                },
                order: 1,
            });
            eventContainer.addSubscriber('test', {
                callbackAsync: async (payload: HandlerResponse) => {
                    payload.result += ' > test - subscriber2';
                },
                order: 2,
            });

            const payload: HandlerResponse = {} as HandlerResponse;
            await eventContainer.triggerAsync('test', payload);

            expect(payload.result).toBe('test - subscriber1 > test - subscriber2');
            eventContainer.clear();
        });

        test('Performance Test: 1000 events should be added and 1000 subscribers should be added to each event. Then all events should be triggered at the same time and it should be checked that the subscribers are working.', async () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            for (let i = 0; i < 1000; i++) {
                eventContainer.addSubscriber(`test${i}`, {
                    callbackAsync: async (payload: HandlerResponse) => {
                        payload.result = `test${i} - subscriber1`;
                    },
                    order: 1,
                });
                eventContainer.addSubscriber(`test${i}`, {
                    callbackAsync: async (payload: HandlerResponse) => {
                        payload.result += ` > test${i} - subscriber2`;
                    },
                    order: 2,
                });
            }

            const payload: HandlerResponse = {} as HandlerResponse;
            for (let i = 0; i < 1000; i++) {
                await eventContainer.triggerAsync(`test${i}`, payload);
            }

            expect(payload.result).toBe(`test999 - subscriber1 > test999 - subscriber2`);
            eventContainer.clear();
        }, 10000);
    });
});
