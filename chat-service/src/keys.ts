import { BindingKey } from "@loopback/core";
import QueueListenerAdapter from "./adapters/QueueListenerAdapter";
import RabbitService from "./services/rabbit.service";

export namespace RabbitServiceBindings {
    export const RABBIT_SERVICE = BindingKey.create<RabbitService>('services.rabbitmq')
}
export namespace QueueListenerAdapterBindings {
    export const QUEUE_LISTENER_ADAPTER = BindingKey.create<QueueListenerAdapter>('adapters.queue.listener')
}