import { belongsTo, Entity, model, property } from '@loopback/repository';
import { SubmissionStatus } from '../keys';
import { Problem } from './problem.model';

@model({
  settings: {
  }
})
export class Submission extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataType: 'INTEGER',
    },
  })
  id?: string;

  @property({
    type: 'string',
    default: SubmissionStatus.PENDING
  })
  status: SubmissionStatus;

  @property({
    type: 'string',
    required: true
  })
  blocksXml: string
  @property({
    type: 'string',
  })
  error?: string
  @property({
    type: 'date',
    defaultFn: 'now',
    postgresql: {
      columnName: 'created_at',
    }
  })
  createdAt: Date;
  @property.array(Object, { hidden: true })
  results?: string[]
  @property({ type: 'number', default: 0 })
  successfulRate: number;
  @property({ type: 'string', required: true })
  userURI: string;

  @belongsTo(() => Problem)
  problemId: string;

  constructor(data?: Partial<Submission>) {
    super(data);
  }
}

export interface SubmissionRelations {

}

export type SubmissionWithRelations = Submission & SubmissionRelations;
