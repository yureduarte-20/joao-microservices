import { Router } from "express";
import { authServiceProxy } from "../controllers/AuthController";
import { userServiceByIdProxy, userServiceProxy } from "../controllers/UserProxyService";
import { AuthorizationMiddleware, verify } from "../middlewares";
import ResourceOwnerMiddleware from "../middlewares/ResourceOwnerMiddleware";
const router = Router();


router.post('/login', authServiceProxy)

router.all('/users', verify, AuthorizationMiddleware.handle, userServiceProxy)
router.all('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)
router.all('/admin/users/*', verify, AuthorizationMiddleware.handle, userServiceProxy)
export default router