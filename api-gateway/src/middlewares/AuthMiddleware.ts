import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { UserData } from "../types";
const secret = process.env.JWT_SECRET as string;

export const generateToken = ({ email, id, name }: UserData) => {
    return jwt.sign({ email, id, name }, secret, { expiresIn: '2h' });
};
export const verify = (req: any, res: Response, next: NextFunction) => {
    var token: string = req.headers["Authorization"] ?? req.headers["authorization"] as string;
    if (!token)
        return res.status(401).json({ auth: false, message: "No token provided." });
    if (!token.startsWith('Bearer')) return res.status(401).json({ auth: false, message: "Invalid Format." });

    token = token.split(' ')[1]
    jwt.verify(token, secret, function (err, decoded) {
        if (err)
            return res
                .status(500)
                .json({ auth: false, message: "Failed to authenticate token." });

        // se tudo estiver ok, salva no request para uso posterior
        req.userData = decoded;
        console.log(decoded)
        next();
    });
};
export const extractData = async (token: string): Promise<any> => {
    return new Promise<any>((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return reject(err)
            resolve(decoded)
        })
    })
}