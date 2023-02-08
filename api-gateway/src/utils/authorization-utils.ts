import { Responsability } from "../types"
import api_user_service from "./api"

export const getUserResponsibilities = async (userId: string): Promise<{responsibilities:Responsability[]}> => {
    const { data } = await api_user_service.get(`admin/users/${userId}?filter=${JSON.stringify({ fields: { responsibilities: true } })}`)
    return data
}

