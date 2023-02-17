import { Request } from 'express'
import httpProxy from 'express-http-proxy'
import ServersErrors from '../handlers/ServersErrors'
import { HTPP_METHODS as HTTP_METHODS, UserData } from '../types'

export const submissionServiceProxy = httpProxy(process.env.SUBMISSION_SERVICE as string, {
    proxyReqBodyDecorator(bodyContent, srcReq) {
        if ([HTTP_METHODS.POST].includes(srcReq.method as HTTP_METHODS)) {
            const { userData }: Request & { userData: UserData } = srcReq as any
            let _bodyContent = srcReq.body
            _bodyContent.userURI = `/users/${userData.id}`
            return _bodyContent
        }
        return bodyContent
    },
    proxyReqPathResolver(req) {
        console.log(req.url)
        let url = new URL(process.env.SUBMISSION_SERVICE + req.url)
        if ([HTTP_METHODS.GET].includes(req.method as HTTP_METHODS)) {
            if (req.path == '/submissions') {
                const { userData }: Request & { userData: UserData } = req as any
                return req.path + `/${userData.id}` + url.search
            }
        }
        return req.url
    },

    proxyErrorHandler: ServersErrors
})
export const submissionServiceProxyPOST = httpProxy(process.env.PROBLEM_SERVICE_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq) {
        if ([HTTP_METHODS.POST].includes(srcReq.method as HTTP_METHODS)) {
            const { userData }: Request & { userData: UserData } = srcReq as any
            let _bodyContent = srcReq.body
            _bodyContent.userURI = `/users/${userData.id}`
            return _bodyContent
        }
        return bodyContent
    },
    proxyErrorHandler: ServersErrors
})