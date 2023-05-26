import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {SECURITY_SCHEME_SPEC} from '@loopback/authentication-jwt';
import {AuthorizationComponent, AuthorizationDecision, AuthorizationOptions, AuthorizationTags} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import EvaluatorAdapter from './adapters/EvaluatorAdapter';
import QueueListenerAdapter from './adapters/QueueListenerAdapter';
import {JWTStrategy} from './authentication-strategies/jwt-strategy';
import {
  EvaluatorAdapterBinding, JudgeConectorAdapterBindings as JudgeConnectorAdapterBindings, QueueListenerAdapterBindinds, RabbitServiceBindings,
  TokenServiceBindings, TokenServiceConstants
} from './keys';
import AuthorizationProvider from './providers/Authorization';
import {MySequence} from './sequence';
import JWTSequence from './sequenceJwt';
import {JWTService} from './services/jwt-service';
import RabbitService from './services/rabbit.service';
export {ApplicationConfig};

export class ProblemsServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);
    this.sequence(JWTSequence);
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy)
    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    //atuenticação
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE)
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);

    this.bind(JudgeConnectorAdapterBindings.JUDGE_ADAPTER).toClass(QueueListenerAdapter)
    this.bind(RabbitServiceBindings.RABBIT_SERVICE).toClass(RabbitService)
    this.bind(EvaluatorAdapterBinding.EVALUATOR_ADAPTER).toClass(EvaluatorAdapter)
    this.bind(QueueListenerAdapterBindinds.QUEUE_LISTENER_ADAPTER).toClass(QueueListenerAdapter)
    this.bind('authentication.jwt.expires.in.seconds').to(25200)


    const authorizationOptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };

    const binding = this.component(AuthorizationComponent);
    this.configure(binding.key).to(authorizationOptions);
    this
      .bind('authorizationProviders.my-authorizer-provider')
      .toProvider(AuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
    this.addSecuritySpec()

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
  }
  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'Canaa API application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: ''}],
    });
  }
}
