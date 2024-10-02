"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventContainer = void 0;
const ck_ms_di_1 = require("ck-ms-di");
let EventContainer = class EventContainer {
    constructor(serviceContainer) {
        this.events = new Map();
        this.serviceContainer = serviceContainer;
    }
    addEvent(eventModel) {
        if (!eventModel.event || eventModel.event === '') {
            throw new Error('Event name is required');
        }
        if (this.events.has(eventModel.event)) {
            throw new Error('Event already exists');
        }
        this.events.set(eventModel.event, eventModel);
    }
    getEvent(eventName) {
        return this.events.get(eventName);
    }
    addSubscriber(eventName, subscriber) {
        var _a;
        if (!this.events.has(eventName)) {
            const newEvent = {
                event: eventName,
                subscribers: [subscriber],
            };
            this.addEvent(newEvent);
            return;
        }
        const event = this.getEvent(eventName);
        if (event.subscribers.some((sub) => sub.callbackAsync === subscriber.callbackAsync)) {
            throw new Error('Subscriber already exists');
        }
        subscriber.order = (_a = subscriber.order) !== null && _a !== void 0 ? _a : event.subscribers.length + 1;
        event.subscribers.push(subscriber);
        event.subscribers = event.subscribers.sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
    }
    triggerAsync(eventName, payload, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const event = this.getEvent(eventName);
            if (!event) {
                this.addEvent({
                    event: eventName,
                    subscribers: [],
                });
            }
            else {
                if (this.serviceContainer && !sessionId) {
                    sessionId = this.serviceContainer.beginSession();
                }
                sessionId = (_a = this.serviceContainer) === null || _a === void 0 ? void 0 : _a.beginSession();
                payload.sessionId = sessionId;
                for (const subscriber of event.subscribers) {
                    yield subscriber.callbackAsync(payload);
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
        });
    }
    get eventsList() {
        return Object.freeze([...this.events.values()]);
    }
    getSubscriber(eventName, order) {
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
    removeSubscriber(eventName, order) {
        const event = this.getEvent(eventName);
        if (event) {
            event.subscribers = event.subscribers.filter((sub) => sub.order !== order);
            event.subscribers = event.subscribers.sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
        }
    }
    removeEvent(eventName) {
        this.events.delete(eventName);
    }
    clear() {
        this.events.clear();
    }
};
exports.EventContainer = EventContainer;
exports.EventContainer = EventContainer = __decorate([
    (0, ck_ms_di_1.Service)({ name: 'EventContainer', lifecycle: 'singleton' }),
    __metadata("design:paramtypes", [ck_ms_di_1.ServiceContainer])
], EventContainer);
//# sourceMappingURL=EventContainer.js.map