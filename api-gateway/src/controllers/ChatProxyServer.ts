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


export const chatAdminProxyServer = httpProxy(process.env.CHAT_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq) {

        return bodyContent
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

export const chatDoubtProxyServer = httpProxy(process.env.CHAT_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq: any) {
        if ([HTPP_METHODS.PATCH, HTPP_METHODS.PUT, HTPP_METHODS.POST].includes(srcReq.method)) {
            let _bodyContent = srcReq.body
            _bodyContent.userURI = '/users/' + srcReq.userData.id
            _bodyContent.userName = srcReq.userData.name
            console.log(_bodyContent)
            return JSON.stringify(_bodyContent)
        }
        // console.log(srcReq.path)
        return bodyContent
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})