import { NextFunction, Request, Response } from "express";
import { PATHS } from "../autorizationPathSpec";
import { HTPP_METHODS, UserData } from "../types";

export default class ResourceOwnerMiddleware {
    private static readonly ALL_PATHS = PATHS
    public static verifyRoutesParamsId(req: Request, response: Response, next: NextFunction) {
        let find = false;
        for (const path of ResourceOwnerMiddleware.ALL_PATHS) {
            if (
                path.pathName.test(req.path)
                && path.hasParamId
                && path.onlyOnwer
                && path.method.includes(req.method as HTPP_METHODS)
            ) {
                find = true;
                const param = ResourceOwnerMiddleware.extractParamId(req);
                console.log(param,)
                if (!param) {
                    response.status(400)
                    return response.json({ error: { message: 'Escopo inválido' } })
                }
                const _req: Request & { userData: UserData } = req as any;
                if (param !== _req.userData.id) {
                    return response.status(403).json({ error: { message: 'Não autorizado a atualizar recursos que não são seus' } })
                }
            }
        }
        return next()
    }
    private static extractParamId(req: Request) {
        return req.params.userId
    }
}