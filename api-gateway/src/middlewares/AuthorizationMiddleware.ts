import { NextFunction, Request, Response } from "express";
import { PATHS } from "../autorizationPathSpec";
import { PathSpec, Roles, UserData } from "../types";
import { UserCacheAdapter } from "../utils/userCacheAdapter";

export class AuthorizationMiddleware {
    private static paths: PathSpec[] = PATHS
    private static userCacheAdapter: UserCacheAdapter = new UserCacheAdapter();
    static async handle(req: any, res: Response, next: NextFunction) {
        const _req: Request & { userData: UserData } = req as any
        for (const path of AuthorizationMiddleware.paths) {
            //console.log(path, path.pathName.test(req.path), req.path)
            if (path.pathName.test(req.path)) {
                if (_req.userData.responsibilities.some(resp =>
                    path.allowedRoles.includes(resp.role)
                    && path.service.includes(resp.service)
                    && path.method.includes(req.method)
                ))
                    return next();
            }
        }
        return res.status(403).json({ error: { message: 'Não autorizado' } })
    }
    static async onlyAdmin(req: Request, res: Response, next: NextFunction) {
        const _req: Request & { userData: UserData } = req as any
        if (_req.userData.responsibilities.some(res => res.role === Roles.ADMIN))
            return next();
        res.status(403).json({ error: { message: 'Não autorizado' } })
    }
}