import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import { MySequence } from './sequence';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import { JWTStrategy } from './authentication-strategies/jwt-strategy';
import JWTSequence from './sequenceJwt'
import { TokenServiceBindings, TokenServiceConstants, UserServiceBindings } from './keys';
import { JWTService } from './services/jwt-service';
import { SECURITY_SCHEME_SPEC } from '@loopback/authentication-jwt';
import { MyUserService } from './services/user-service';
import { AuthorizationOptions, AuthorizationDecision, AuthorizationComponent, AuthorizationTags } from '@loopback/authorization';
import AuthorizationProvider from './providers/Authorization';
export { ApplicationConfig };

export class UserServiceApplication extends BootMixin(
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
    this.addSecuritySpec()
    this.component(RestExplorerComponent);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE)
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    // autorização
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
      components: { securitySchemes: SECURITY_SCHEME_SPEC },
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{ url: '' }],
    });
  }
}
