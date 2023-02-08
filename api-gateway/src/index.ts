import Express, { Request, Response, NextFunction, } from "express";
import httpProxy from 'express-http-proxy'
import { verify } from "./middlewares";
import { userQuerryHandler, user_routes } from "./handlers/user-service.handler";
import { authController } from "./controllers/AuthController";
import { admin_routes } from "./handlers/admin-handler";
import { AuthorizationMiddleware } from "./middlewares";
import ResourceOwnerMiddleware from "./middlewares/ResourceOwnerMiddleware";


const PORT = process.env.API_GATEWAY_PORT || 3000
const app = Express();


async function selectProxyHost(req: any) {
    return user_routes(req)
    if (req.path.startsWith('/users'))
        return user_routes(req);
    if (req.path.startsWith('/admin'))
        return admin_routes(req, '1');
    else if (req.path.startsWith('/cinemas'))
        return 'http://localhost:3001/';
    else return ''
}
app.use(Express.json())
app.post('/login', authController)
app.use(
    verify,
    AuthorizationMiddleware.handle,
    ResourceOwnerMiddleware.verifyRoutesParamsId,
    (req: Request, res: Response, next: NextFunction) => {

        selectProxyHost(req).then((url) => {
            const fun = httpProxy(url, { 
                userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
                    let resData = Buffer.from(proxyResData).toString('utf-8')
                    let obj = JSON.parse(resData)
                    userRes.status(proxyRes?.statusCode || 500)
                    userRes.json(obj)
                    return obj
                },
             });
            fun(req, res, next)
        }).catch(e => res.status(500).json({ e }))
    });

app.listen(PORT, () => {
    console.log('API gateway running in port:' + PORT)
})