import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {ChatDatasourceDataSource} from '../datasources';
import {Doubt, DoubtRelations} from '../models';

export class DoubtRepository extends DefaultCrudRepository<
  Doubt,
  typeof Doubt.prototype.id,
  DoubtRelations
> {
  constructor(
    @inject('datasources.ChatDatasource') dataSource: ChatDatasourceDataSource,
  ) {
    super(Doubt, dataSource);
  }
}
