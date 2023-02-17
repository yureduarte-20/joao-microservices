import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'MongoProblem',
  connector: 'mongodb',
  url: process.env.MONGO_URL as string,
  host: '',
  port: 0,
  user: '',
  password: '',
  database: '',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongoProblemDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'MongoProblem';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.MongoProblem', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
