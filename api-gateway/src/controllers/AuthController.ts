import httpProxy from 'express-http-proxy'
import { generateToken, extractData } from "../middlewares/AuthMiddleware";

export const authServiceProxy = httpProxy(process.env.USER_SERVICE_API_URL as string, {
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        let resData = Buffer.from(proxyResData).toString('utf-8')
        let obj = JSON.parse(resData)
        if (proxyRes.statusCode && proxyRes.statusCode == 200 ) {
            const token = generateToken(obj);
            userRes.status(proxyRes.statusCode);
            return { token }
        }
        return proxyResData
    },
    proxyReqBodyDecorator: (bodyContent, srcReq) => {
        try {
            let reqBody: any = {}
            console.log(reqBody, srcReq.body)
            reqBody.email = srcReq.body.email;
            reqBody.password = srcReq.body.password;
            bodyContent = reqBody
        } catch (e) {
            console.error(e)
        }
        return bodyContent
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers = { ...srcReq.headers}
        proxyReqOpts.method = srcReq.method
        console.log(proxyReqOpts, srcReq.body)
        return proxyReqOpts
    },

})