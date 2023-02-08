import { NextFunction, Request, Response } from "express";
import { PATHS } from "../autorizationPathSpec";
import { UserData } from "../types";

export default class ResourceOwnerMiddleware {
    private static ALL_PATHS = PATHS
    public static verifyRoutesParamsId(req: Request, response: Response, next: NextFunction) {
        for(const path of ResourceOwnerMiddleware.ALL_PATHS){
            if(path.pathName.test(req.path) && path.hasParamId && path.onlyOnwer){
                const param = ResourceOwnerMiddleware.extractParamId(req);
                const _req : Request & { userData:UserData } = req as any;
                if(param !== _req.userData.id){
                    return response.status(403).json({ error:{ message:"Não autorizado" } })
                }
            }
        }
        return next()
    }
    private static extractParamId(req: Request) {
        const [_, basePath, ...params] = req.url.split('/');
        
        return  Array.isArray(params) ? params[0] : params
    }
}