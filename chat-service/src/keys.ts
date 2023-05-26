import { BindingKey } from "@loopback/core";
import QueueListenerAdapter from "./adapters/QueueListenerAdapter";
import RabbitService from "./services/rabbit.service";
import { TokenService, UserService } from "@loopback/authentication";
import * as fs from 'fs';

import {securityId} from '@loopback/security';
export enum Roles {
    ADMIN = 'ADMIN',
    ADVISOR = 'ADVISOR',
    STUDENT = 'STUDENT'
}

export enum Services {
    USER_SERVICE = 'USER_SERVICE',
    PROBLEM_SERVICE = 'PROBLEM_SERVICE',
    CHAT_SERVICE = 'CHAT_SERVICE',
    JUDGE_SERVICE = 'JUDGE_SERVICE'
}

export type Responsability = {
    service: Services;
    role: Roles
}

export namespace RabbitServiceBindings {
    export const RABBIT_SERVICE = BindingKey.create<RabbitService>('services.rabbitmq')
}
export namespace QueueListenerAdapterBindings {
    export const QUEUE_LISTENER_ADAPTER = BindingKey.create<QueueListenerAdapter>('adapters.queue.listener')
}
export type CustomUserProfile = {
    [securityId]: string,
    id: string,
    name: string,
    email: string,
    roles: Responsability[],
    responsibilities: Responsability[]
  }
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH ?? 'public_key.pem').toString();

export type Credentials = {
    email: string;
    password: string;
}
export namespace TokenServiceConstants {
    export const TOKEN_SECRET_VALUE = publicKey;
    export const TOKEN_EXPIRES_IN_VALUE = '7h';
}
export namespace TokenServiceBindings {
    export const TOKEN_SECRET = BindingKey.create<string>(
        'authentication.jwt.secret',
    );
    export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
        'authentication.jwt.expiresIn',
    );
    export const TOKEN_SERVICE = BindingKey.create<TokenService>(
        'services.jwt.service',
    );
}

export namespace UserServiceBindings {
    export const USER_SERVICE = BindingKey.create<UserService<Credentials, any>>(
        'services.user.service',
    );
}