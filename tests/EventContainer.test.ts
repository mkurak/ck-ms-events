import { ServiceContainer } from 'ck-ms-di';
import { EventContainer, HandlerResponse } from '../src/EventContainer';

describe('EventContainer', () => {
    describe('Servis olarak kullanılmıyor olduğu durumlardaki testler', () => {
        test('Bir olay eklenebilmeli.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addEvent({ event: 'test', subscribers: [] });
            expect(eventContainer.getEvent('test')).toBeDefined();
        });

        test('Birden fazla olay eklenebilmeli.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
        });

        test('Bir olay ve bir abone eklenebilmeli.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test', { callbackAsync: async () => {}, order: 1 });
            expect(eventContainer.getEvent('test')).toBeDefined();
            expect(eventContainer.getEvent('test')?.subscribers.length).toBe(1);
        });

        test('Birden fazla olay ve her olaya birden fazla abone eklenebilmeli.', () => {
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

        test('Birden fazla olay eklenebilmeli ve sonrasında içlerinden biri silinebilmeli.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
        });

        test('Birden fazla olay ve her olaya birden fazla abone eklenebilmeli ve sonrasında içlerinden biri silinebilmeli.', () => {
            const eventContainer = new EventContainer();
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test1', { callbackAsync: async () => {}, order: 2 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 1 });
            eventContainer.addSubscriber('test2', { callbackAsync: async () => {}, order: 2 });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
        });

        test('Birden fazla olay eklenebilmeli ve sonrasında her birine birden fazla abone eklenebilmeli. Sonrasında abonelerden bazıları silinebilmeli.', () => {
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

        test('Bir olay eklenebilmeli ve bu olaya da birden fazla abone eklenebilmeli. Daha sonrasında da olay tetiklenmeli ve abonelerin çalıştığı kontrol edilmeli.', async () => {
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

        test('Performans Testi: 1000 olay eklenmeli ve her bir olaya 1000 abone eklenmeli. Daha sonrasında da tüm olaylar aynı anda tetiklenmeli ve abonelerin çalıştığı kontrol edilmeli.', async () => {
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

    describe('Servis olarak kullanılıyor olduğu durumlardaki testler', () => {
        test('Bir olay eklenebilmeli.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addEvent({ event: 'test', subscribers: [] });
            expect(eventContainer.getEvent('test')).toBeDefined();
            eventContainer.clear();
        });

        test('Birden fazla olay eklenebilmeli.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            expect(eventContainer.getEvent('test1')).toBeDefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
            eventContainer.clear();
        });

        test('Bir olay ve bir abone eklenebilmeli.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addSubscriber('test', { callbackAsync: async () => {}, order: 1 });
            expect(eventContainer.getEvent('test')).toBeDefined();
            expect(eventContainer.getEvent('test')?.subscribers.length).toBe(1);
            eventContainer.clear();
        });

        test('Birden fazla olay ve her olaya birden fazla abone eklenebilmeli.', () => {
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

        test('Birden fazla olay eklenebilmeli ve sonrasında içlerinden biri silinebilmeli.', () => {
            const serviceContainer = ServiceContainer.getInstance();
            const eventContainer = serviceContainer.resolve<EventContainer>(EventContainer);
            eventContainer.addEvent({ event: 'test1', subscribers: [] });
            eventContainer.addEvent({ event: 'test2', subscribers: [] });
            eventContainer.removeEvent('test1');
            expect(eventContainer.getEvent('test1')).toBeUndefined();
            expect(eventContainer.getEvent('test2')).toBeDefined();
            eventContainer.clear();
        });

        test('Birden fazla olay ve her olaya birden fazla abone eklenebilmeli ve sonrasında içlerinden biri silinebilmeli.', () => {
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

        test('Birden fazla olay eklenebilmeli ve sonrasında her birine birden fazla abone eklenebilmeli. Sonrasında abonelerden bazıları silinebilmeli.', () => {
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

        test('Bir olay eklenebilmeli ve bu olaya da birden fazla abone eklenebilmeli. Daha sonrasında da olay tetiklenmeli ve abonelerin çalıştığı kontrol edilmeli.', async () => {
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

        test('Performans Testi: 1000 olay eklenmeli ve her bir olaya 1000 abone eklenmeli. Daha sonrasında da tüm olaylar aynı anda tetiklenmeli ve abonelerin çalıştığı kontrol edilmeli.', async () => {
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
