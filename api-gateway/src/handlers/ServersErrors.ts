import { NextFunction, Response } from "express";

export default (err: any, res: Response, next: NextFunction) => {
    switch (err && err.code) {
        case 'ECONNRESET': { return res.status(504).json() }
        case 'ECONNREFUSED': { return res.status(503).json({ error:{ message:'Serviço indisponível no momento' } }) }
        default: { next(err); }
    }
}