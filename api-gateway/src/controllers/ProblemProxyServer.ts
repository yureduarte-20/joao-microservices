import { Request } from 'express';
import httpProxy from 'express-http-proxy'
import proxyReqOptDecorator from '../handlers/HeadersHandler';
import ServersErrors from '../handlers/ServersErrors';
import { HTPP_METHODS } from '../types';

export const problemProxyServer = httpProxy(process.env.PROBLEMS_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq: any) {
        if ([HTPP_METHODS.PATCH, HTPP_METHODS.PUT, HTPP_METHODS.POST].includes(srcReq.method)) {
            if (srcReq.path.match(/\/problems\/[0-f]+\/submissions/)) {
                let _bodyContent = srcReq.body
                _bodyContent.createdByURI = '/users/' + srcReq.userData.id
                console.log(_bodyContent)
                return JSON.stringify(_bodyContent)
            }
            if (srcReq.path.match(/\/problems\/[0-f]+\/doubt/)) {
                let _bodyContent = srcReq.body
                _bodyContent.userURI = '/users/' + srcReq.userData.id
                _bodyContent.userName = srcReq.userData.name
                console.log(_bodyContent)
                return JSON.stringify(_bodyContent)
            }
        }
       // console.log(srcReq.path)
        return bodyContent
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})

export const adminProblemProxyServer = httpProxy(process.env.PROBLEMS_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq: any) {
        if ([HTPP_METHODS.PATCH, HTPP_METHODS.PUT, HTPP_METHODS.POST].includes(srcReq.method)) {
            if (srcReq.path.match(/\/problems\/?/)) {
                let _bodyContent = srcReq.body
                _bodyContent.createdByURI = '/users/' + srcReq.userData.id
                console.log(_bodyContent)
                return JSON.stringify(_bodyContent)
            }
        }
       // console.log(srcReq.path)
        return bodyContent
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})
