import { query, Request } from "express";
import { UserData } from "../types";

export const user_routes = (req: any): string => {
    return process.env.USER_SERVICE_API_URL as string
}

export const userQuerryHandler = async (req: any) => {
    const [rawPath, queries]: string[] = req.url.includes('?') ? req.url.split('?') : [req.url, ''];
    const [_void, basePath, paths]: string[] = rawPath.includes('/') ? rawPath.split('/') : [rawPath, ''];
    const user: UserData = req.userData
    let final = `/${basePath}/${user.id}${queries != '' ? '?' + queries : ''}`
    //console.log(rawPath, rawPath.split('/'), final)
    return final

}