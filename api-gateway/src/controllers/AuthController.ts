import { Axios, AxiosError } from "axios";
import { NextFunction, Request, Response } from "express";

import { generateToken, extractData } from "../middlewares/AuthMiddleware";
import api_user_service from "../utils/api";

export const authController = async (request: Request, response: Response, next: NextFunction) => {
    console.log(request.query)
    const { email, password }: { email: string, password: string } = request.body;
    api_user_service.post('/users/check-credentials', { email, password })
        .then(user_service_response => {
           // console.log(user_service_response)
            const token = generateToken(user_service_response.data)
           // extractData(token).then(data => console.log(data)).catch(console.error)
            response.json({ token })
        })
        .catch((error: AxiosError) => {
              console.error(error) 
            if (error.response) {
                return response.status(error.response.status).json(error.response.data)
            }
            if(error.request){
               // console.log(error.request)
                return response.status(500).json({ error:{ message:'Um de nossos serviços está fora de ar' } })
            }
            response.status(500).json()
            console.log(error)
        })
}