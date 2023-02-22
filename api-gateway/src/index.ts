import Express, { Request, Response, NextFunction, } from "express";
import router from "./routes";
import cors from 'cors'

const PORT = parseInt(process.env.API_GATEWAY_PORT as string) || 3000
const HOST = '0.0.0.0'
const app = Express();

app.use(Express.json())
app.use(cors({ origin: process.env.FRONT_CORS_ORIGIN ?? 'http://localhost:3000' }))
app.use(router)
console.log(process.env.USER_SERVICE_API_URL)
app.listen(PORT, HOST,() =>{
    console.log(``)
})