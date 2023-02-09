import { Router } from "express";
import { authServiceProxy } from "../controllers/AuthController";
import { userServiceByIdProxy, userServiceProxy } from "../controllers/UserProxyService";
import { AuthorizationMiddleware, verify } from "../middlewares";
const router = Router();

router.post('/login', authServiceProxy)

router.all('/users', verify, AuthorizationMiddleware.handle,  userServiceProxy)
router.all('/users/:id', verify, AuthorizationMiddleware.handle,  userServiceByIdProxy)
export default router