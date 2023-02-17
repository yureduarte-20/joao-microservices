import { BindingKey } from "@loopback/context";
import JudgeAdapter from "./adapters/JudgeConector";
import RabbitService from "./services/rabbit.service";

export const enum SubmissionStatus {
    ACCEPTED = 'ACCEPTED',
    TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
    PRESENTATION_ERROR = 'PRESENTATION_ERROR',
    PENDING = 'PENDING',
    RUNTIME_ERROR = 'RUNTIME_ERROR',
    COMPILATION_ERROR = 'COMPILATION_ERROR',
    WRONG_ANSWER = 'WRONG_ANSWER'
}

export namespace JudgeConectorAdapterBindings {
    export const JUDGE_ADAPTER = BindingKey.create<JudgeAdapter>('judge.adapter')
}
export namespace RabbitServiceBindings {
    export const RABBIT_SERVICE = BindingKey.create<RabbitService>('services.rabbitmq')
}