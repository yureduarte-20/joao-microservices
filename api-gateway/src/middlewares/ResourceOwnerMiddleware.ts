import { NextFunction, Request, Response } from "express";
import { PATHS } from "../autorizationPathSpec";
import { HTPP_METHODS, UserData } from "../types";

export default class ResourceOwnerMiddleware {
    private static ALL_PATHS = PATHS
    public static verifyRoutesParamsId(req: Request, response: Response) {
        for (const path of ResourceOwnerMiddleware.ALL_PATHS) {
            if (
                path.pathName.test(req.path)
                && path.hasParamId
                && path.onlyOnwer
                && path.method.includes(req.method as HTPP_METHODS)
            ) {
                const param = ResourceOwnerMiddleware.extractParamId(req);
                const _req: Request & { userData: UserData } = req as any;
                if (param !== _req.userData.id) {
                    return response.status(403)
                }
            }
        }
        return response
    }
    private static extractParamId(req: Request) {

        return req.params.id
    }
}