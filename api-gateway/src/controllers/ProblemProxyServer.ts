import { Request } from 'express';
import httpProxy from 'express-http-proxy'
import ServersErrors from '../handlers/ServersErrors';
import { HTPP_METHODS } from '../types';

export const problemProxyServer = httpProxy(process.env.PROBLEM_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq: any) {
        if ([HTPP_METHODS.PATCH, HTPP_METHODS.PUT, HTPP_METHODS.POST].includes(srcReq.method)) {
            let _bodyContent = srcReq.body
            _bodyContent.createdByURI = '/users/' + srcReq.userData.id
            console.log(_bodyContent)
            return JSON.stringify(_bodyContent)
        }
        return bodyContent
    },

    proxyErrorHandler: ServersErrors
})