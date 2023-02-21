import { Request } from 'express'
import httpProxy from 'express-http-proxy'
import proxyReqOptDecorator from '../handlers/HeadersHandler'
import ServersErrors from '../handlers/ServersErrors'
import { HTPP_METHODS, UserData } from '../types'

export const ChatProxyServer = httpProxy(process.env.CHAT_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq) {
        const _req: Request & { userData: UserData } = srcReq as any;
        if ([HTPP_METHODS.POST].includes(_req.method as HTPP_METHODS)) {
            bodyContent.userURI = `/users/${_req.userData.id}`
            return bodyContent
        }
        return bodyContent
    },
    proxyReqPathResolver(req) {
        const url = new URL(process.env.CHAT_SERVICE_URL as string + req.url)
        if ([HTPP_METHODS.GET].includes(req.method as HTPP_METHODS)) {
            const _req: Request & { userData: UserData } = req as any;
            return req.path + `/${_req.userData.id}` + url.search
        }
        return req.url
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})

export const chatAdvisorProxyServer = httpProxy(process.env.CHAT_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq) {
        const _req: Request & { userData: UserData } = srcReq as any;
        if ([HTPP_METHODS.POST].includes(_req.method as HTPP_METHODS)) {
            bodyContent.userURI = `/users/${_req.userData.id}`
            bodyContent.userName = _req.userData.name
            return bodyContent
        }
        return bodyContent
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})