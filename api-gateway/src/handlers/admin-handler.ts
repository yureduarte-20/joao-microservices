import { Request } from "express";
import { getUserResponsibilities } from "../utils/authorization-utils"
import { Roles, Services, UserData } from "../types"


export const admin_routes = (req : Request , userId: string) => {
    req.query = { where:{ id: userId } }
    return 'http://localhost:3001'
}