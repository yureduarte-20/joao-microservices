import Express, { Request, Response, NextFunction, } from "express";
import cors from 'cors'
import httpProxy from 'express-http-proxy'
import proxyReqOptDecorator from "./handlers/HeadersHandler";
import ServersErrors from "./handlers/ServersErrors";
const PORT = parseInt(process.env.API_GATEWAY_PORT as string) || 3000
const HOST = '0.0.0.0'
const app = Express();

function selectProxyHost(req: Request) {
    let path = req.path
    if (path.startsWith('/admin') || path.startsWith('/advisor')) {
        path = '/' + path.split('/')[2]
        console.log(path)
    }

    if (path.startsWith('/users'))
        return process.env.USER_SERVICE_API_URL as string;
    else if (path.startsWith('/problems') || path.startsWith('/submissions'))
        return process.env.PROBLEMS_SERVICE_URL as string;
    else if (path.startsWith('/doubts') || path.startsWith('/doubt'))
        return process.env.CHAT_SERVICE_URL as string;
    else if (path.startsWith('/login'))
        return process.env.USER_SERVICE_API_URL as string;
    else if (path.startsWith('/signup'))
        return process.env.USER_SERVICE_API_URL as string;
    else if (path.startsWith('/profile'))
        return process.env.USER_SERVICE_API_URL as string;
    else return process.env.USER_SERVICE_API_URL as string
}

app.use(Express.json())
app.use(cors({ origin: process.env.FRONT_CORS_ORIGIN ?? 'http://localhost:3000' }))
app.use((req, res, next) => {
    return httpProxy(selectProxyHost(req), {
        proxyReqOptDecorator: proxyReqOptDecorator,
        userResDecorator(proxyRes, proxyResData, userReq, userRes) {
            userRes.setHeader('Content-Type', 'application/json')
            return proxyResData
        },
        proxyErrorHandler: ServersErrors
    })(req, res, next);
});
app.listen(PORT, HOST, () => {
    console.log(``)
})