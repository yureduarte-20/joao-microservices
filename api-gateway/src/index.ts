import Express, { Request, Response, NextFunction, } from "express";
import router from "./routes";


const PORT = process.env.API_GATEWAY_PORT || 3000
const app = Express();

app.use(Express.json())
app.use(router)
console.log(process.env.USER_SERVICE_API_URL)
app.listen(PORT, () => {
    console.log('API gateway running in port:' + PORT)
})