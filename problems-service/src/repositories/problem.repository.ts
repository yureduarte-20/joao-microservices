import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, HasManyRepositoryFactory } from '@loopback/repository';
import { MongoProblemDataSource } from '../datasources';
import { Problem, ProblemRelations } from '../models';


export class ProblemRepository extends DefaultCrudRepository<
  Problem,
  typeof Problem.prototype.id,
  ProblemRelations
> {



  constructor(
    @inject('datasources.MongoProblem') dataSource: MongoProblemDataSource,
  ) {
    super(Problem, dataSource);

  }
}
