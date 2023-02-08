import { getUserResponsibilities } from "./authorization-utils"
import { Responsability } from "../types"
import api_user_service from "./api"


export class UserCacheAdapter {
    public async getUserResponsability(userId : string) : Promise<{responsibilities:Responsability[]}> {
        return getUserResponsibilities(userId)
    }
}