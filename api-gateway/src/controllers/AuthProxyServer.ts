import httpProxy from 'express-http-proxy'
import ServersErrors from '../handlers/ServersErrors';
import { generateToken, extractData } from "../middlewares/AuthMiddleware";

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
    proxyErrorHandler: ServersErrors
})