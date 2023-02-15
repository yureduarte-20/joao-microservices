export type UserData = {
    id: string,
    email: string,
    name: string
    responsibilities: Responsability[]
}
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

export type PathSpec = {
    pathName: RegExp,
    allowedRoles: Roles[]
    service: Services,
    method: HTPP_METHODS[],
    onlyOnwer: boolean,
    hasParamId: boolean
}
export enum HTPP_METHODS {
    GET = 'GET', POST = 'POST', PATCH = 'PATCH', DELETE = 'DELETE', PUT = 'PUT'
} 