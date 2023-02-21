import proxy from "express-http-proxy";
import proxyReqOptDecorator from "../handlers/HeadersHandler";
import ServersErrors from "../handlers/ServersErrors";
import ResourceOwnerMiddleware from "../middlewares/ResourceOwnerMiddleware";
import { HTPP_METHODS } from "../types";

export const userServiceProxy = proxy(process.env.USER_SERVICE_API_URL as string, {
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
        return proxyResData
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler:ServersErrors
})

export const userServiceByIdProxy = proxy(process.env.USER_SERVICE_API_URL as string, {
    proxyReqBodyDecorator(bodyContent, srcReq) {
        if([HTPP_METHODS.PATCH, HTPP_METHODS.PUT].includes(srcReq.method as HTPP_METHODS)){
            bodyContent = srcReq.body
            delete bodyContent.responsibilities
            
        }

        return bodyContent
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})