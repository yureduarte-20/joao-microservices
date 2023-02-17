import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {MongoProblemDataSource} from '../datasources';
import {Submission, SubmissionRelations, Problem} from '../models';
import {ProblemRepository} from './problem.repository';

export class SubmissionRepository extends DefaultCrudRepository<
  Submission,
  typeof Submission.prototype.id,
  SubmissionRelations
> {

  public readonly problem: BelongsToAccessor<Problem, typeof Submission.prototype.id>;

  constructor(
    @inject('datasources.MongoProblem') dataSource: MongoProblemDataSource, @repository.getter('ProblemRepository') protected problemRepositoryGetter: Getter<ProblemRepository>,
  ) {
    super(Submission, dataSource);
    this.problem = this.createBelongsToAccessorFor('problem', problemRepositoryGetter,);
    this.registerInclusionResolver('problem', this.problem.inclusionResolver);
  }
}
