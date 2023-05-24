import { AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer } from '@loopback/authorization'
import { Provider } from '@loopback/core';
import { Responsability } from '../keys';

export default class AuthorizationProvider implements Provider<Authorizer>{

    value(): Authorizer {
        return this.authorize.bind(this);
    }
    async authorize(
        authorizationCtx: AuthorizationContext,
        metadata: AuthorizationMetadata,
    ) {
        const clientRole : any[] = authorizationCtx.principals[0].roles;
        console.log(authorizationCtx.principals[0].roles)
        const allowedRoles = metadata.allowedRoles;
        return clientRole.some((item: Responsability) => allowedRoles?.includes(item.role))
            ? AuthorizationDecision.ALLOW
            : AuthorizationDecision.DENY;
    }
}