import proxy from "express-http-proxy";
import ServersErrors from "../handlers/ServersErrors";
import ResourceOwnerMiddleware from "../middlewares/ResourceOwnerMiddleware";

export const userServiceProxy = proxy(process.env.USER_SERVICE_API_URL as string, {
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
        return proxyResData
    },
    proxyErrorHandler:ServersErrors
})

export const userServiceByIdProxy = proxy(process.env.USER_SERVICE_API_URL as string, {

})