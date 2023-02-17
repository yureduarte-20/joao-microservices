import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { MongoProblemDataSource } from '../datasources';
import { Problem, ProblemRelations, Submission} from '../models';
import {SubmissionRepository} from './submission.repository';

export class ProblemRepository extends DefaultCrudRepository<
  Problem,
  typeof Problem.prototype.id,
  ProblemRelations
> {

  public readonly submissions: HasManyRepositoryFactory<Submission, typeof Problem.prototype.id>;

  constructor(
    @inject('datasources.MongoProblem') dataSource: MongoProblemDataSource, @repository.getter('SubmissionRepository') protected submissionRepositoryGetter: Getter<SubmissionRepository>,
  ) {
    super(Problem, dataSource);
    this.submissions = this.createHasManyRepositoryFactoryFor('submissions', submissionRepositoryGetter,);
    this.registerInclusionResolver('submissions', this.submissions.inclusionResolver);

  }
}
