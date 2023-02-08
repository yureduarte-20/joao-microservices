import axios from "axios";

const api_user_service = axios.create({ baseURL: process.env.USER_SERVICE_API_URL })

export default api_user_service;