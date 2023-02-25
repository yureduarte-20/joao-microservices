import httpProxy from 'express-http-proxy'
import proxyReqOptDecorator from '../handlers/HeadersHandler';
import ServersErrors from '../handlers/ServersErrors';
import { generateToken } from "../middlewares/AuthMiddleware";
console.log(process.env.USER_SERVICE_API_URL, process.env.PROBLEMS_SERVICE_URL, process.env.CHAT_SERVICE_URL)
export const authServiceProxy = httpProxy(process.env.USER_SERVICE_API_URL as string, {
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        let resData = Buffer.from(proxyResData).toString('utf-8')
        let obj = JSON.parse(resData)

        if (!proxyRes.statusCode) {
            userRes.status(500)
            return { error: { message: 'Error' } }
        }
        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
            const token = generateToken(obj);
            userRes.status(proxyRes.statusCode);
            return { token }
        }
        if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 600) {
            userRes.status(proxyRes.statusCode);
            return obj
        }

        return proxyResData
    },
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})
export const authSignupServiceProxy = httpProxy(process.env.USER_SERVICE_API_URL as string, {
    proxyReqOptDecorator: proxyReqOptDecorator,
    proxyErrorHandler: ServersErrors
})