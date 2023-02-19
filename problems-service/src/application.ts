import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { EvaluatorAdapterBinding, JudgeConectorAdapterBindings as JudgeConnectorAdapterBindings, RabbitServiceBindings } from './keys';
import QueueListenerAdapter from './adapters/QueueListenerAdapter';
import RabbitService from './services/rabbit.service';
import EvaluatorAdapter from './adapters/EvaluatorAdapter';

export {ApplicationConfig};

export class ProblemsServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    this.bind(JudgeConnectorAdapterBindings.JUDGE_ADAPTER).toClass(QueueListenerAdapter)
    this.bind(RabbitServiceBindings.RABBIT_SERVICE).toClass(RabbitService)
    this.bind(EvaluatorAdapterBinding.EVALUATOR_ADAPTER).toClass(EvaluatorAdapter)
  }
}
