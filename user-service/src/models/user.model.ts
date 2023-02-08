import {Entity, model, property} from '@loopback/repository';
import {Responsability, Roles, Services} from '../keys';


@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    hidden: true
  })
  password: string;

  @property.array(Object, {
    jsonSchema: {
      properties: {
        service: {
          type: 'string',
          enum: Object.values(Services)
        },
        role: {
          type: 'string',
          enum: Object.values(Roles)
        },
      }
    }
  })
  responsibilities: Responsability[];


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
