import { getUserResponsibilities } from "./authorization-utils"
import { Responsability } from "../types"
import api_user_service from "./api"


export class UserCacheAdapter {
    private static usersResponsabities: Map<string, { responsibilities: Responsability[] }> = new Map()
    public async getUserResponsability(userId: string): Promise<{ responsibilities: Responsability[] }> {
        if (UserCacheAdapter.usersResponsabities.has(userId)) {
            return Promise.resolve(UserCacheAdapter.usersResponsabities.get(userId) as { responsibilities: Responsability[] })
        }
        let data = await getUserResponsibilities(userId)
        UserCacheAdapter.usersResponsabities.set(userId, data)
        return Promise.resolve(data)

    }
}