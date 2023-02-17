import { Router } from "express";
import { authServiceProxy } from "../controllers/AuthProxyServer";
import { problemProxyServerAdmin } from "../controllers/ProblemProxyServer";
import { submissionServiceProxy, submissionServiceProxyPOST } from "../controllers/SubmissionProxyServer";
import { userServiceByIdProxy, userServiceProxy } from "../controllers/UserProxyService";
import { AuthorizationMiddleware, verify } from "../middlewares";
import ResourceOwnerMiddleware from "../middlewares/ResourceOwnerMiddleware";
const router = Router();


router.post('/login', authServiceProxy)

//rotas de usuários
router.get('/users', verify, AuthorizationMiddleware.handle, userServiceProxy)
router.get('/users/:userId', verify, AuthorizationMiddleware.handle, userServiceProxy)
router.patch('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)
router.put('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)
router.delete('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)

router.all('/admin/users/*', verify, AuthorizationMiddleware.handle, userServiceProxy)
router.post('/admin/problems', verify, AuthorizationMiddleware.handle, problemProxyServerAdmin)
router.all('/admin/problems/*', verify, AuthorizationMiddleware.handle, problemProxyServerAdmin)

router.post('/problems/submission', verify, submissionServiceProxyPOST)
router.get('/submissions', verify , submissionServiceProxy)
router.all('*', (req, res) => {
    res.status(404).json({ error: { message: 'Recurso não encontrado' } }); // <== YOUR JSON DATA HERE
});
export default router