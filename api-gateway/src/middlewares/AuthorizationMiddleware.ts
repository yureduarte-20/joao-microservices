import { NextFunction, Request, Response } from "express";
import { PATHS } from "../autorizationPathSpec";
import { PathSpec } from "../types";
import { UserCacheAdapter } from "../utils/userCacheAdapter";

export class AuthorizationMiddleware {
    private static paths: PathSpec[] = PATHS
    private static userCacheAdapter: UserCacheAdapter = new UserCacheAdapter();
    static async handle(req: any, res: Response, next: NextFunction) {
        for (const path of AuthorizationMiddleware.paths) {
            if (path.pathName.test(req.path)) {
                return AuthorizationMiddleware.userCacheAdapter.getUserResponsability(req.userData.id).then(data => {
                    // console.log(data)
                    if (data.responsibilities.some(resp =>
                        path.allowedRoles.includes(resp.role)
                        && path.service.includes(resp.service)
                        &&  path.method.includes(req.method)
                        ))
                        return next();
                    return res.status(403).json({ error: { message: 'Não autorizado' } })
                }).catch(err => { console.error(err); res.status(500).json({ error: { message: 'Erro ao conseguir dados do usuário' } }) })
            }
        }
        res.status(404).json({ error: { message: 'Recurso não encontrado' } })
    }
}