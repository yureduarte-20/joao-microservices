import proxy from "express-http-proxy";
import ResourceOwnerMiddleware from "../middlewares/ResourceOwnerMiddleware";

export const userServiceProxy = proxy(process.env.USER_SERVICE_API_URL as string, {
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
        return proxyResData
    }, 
})

export const userServiceByIdProxy = proxy(process.env.USER_SERVICE_API_URL as string, {
    userResDecorator(proxyRes, proxyResData, userReq, userRes) {
        let result = ResourceOwnerMiddleware.verifyRoutesParamsId(userReq, userRes);
        if(result.statusCode == 403){
            return { error:{ message: 'Não autorizado' } }
        }
        return proxyResData
    },
})