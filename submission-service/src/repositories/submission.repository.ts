import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoProblemDataSource} from '../datasources';
import {Submission, SubmissionRelations} from '../models';

export class SubmissionRepository extends DefaultCrudRepository<
  Submission,
  typeof Submission.prototype.id,
  SubmissionRelations
> {
  constructor(
    @inject('datasources.MongoProblem') dataSource: MongoProblemDataSource,
  ) {
    super(Submission, dataSource);
  }
}
