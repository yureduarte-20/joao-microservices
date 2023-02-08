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
