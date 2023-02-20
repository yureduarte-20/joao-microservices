import { Router } from "express";
import { authServiceProxy } from "../controllers/AuthProxyServer";
import { chatAdvisorProxyServer, ChatProxyServer } from "../controllers/ChatProxyServer";
import { problemProxyServer } from "../controllers/ProblemProxyServer";
import { submissionServiceProxy } from "../controllers/SubmissionProxyServer";
import { userServiceByIdProxy, userServiceProxy } from "../controllers/UserProxyService";
import { AuthorizationMiddleware, verify } from "../middlewares";
import ResourceOwnerMiddleware from "../middlewares/ResourceOwnerMiddleware";
const router = Router();


router.post('/login', authServiceProxy)

//rotas de usuários
router.get('/users', verify, userServiceProxy)
router.get('/users/:userId', verify, userServiceProxy)
router.patch('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)
router.put('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)
router.delete('/users/:userId', verify, AuthorizationMiddleware.handle, ResourceOwnerMiddleware.verifyRoutesParamsId, userServiceByIdProxy)

router.all('/admin/users/*', verify, AuthorizationMiddleware.handle, userServiceProxy)
router.post('/admin/problems', verify, AuthorizationMiddleware.handle, problemProxyServer)
router.all('/admin/problems/*', verify, AuthorizationMiddleware.handle, problemProxyServer)
router.get('/problems', verify, problemProxyServer)

router.post('/problems/:id/submissions', verify ,submissionServiceProxy)
router.get('/submissions', verify, submissionServiceProxy)
router.get('/submissions/:id', verify, submissionServiceProxy)

// enviar mensagem
router.post('/doubts/:id', verify, chatAdvisorProxyServer)
// encerrar conversa
router.post('/doubts/close/:id', verify, ChatProxyServer)
// se increver em uma conversa
router.post('/advisor/doubts/subscribe/:doubtId', verify, AuthorizationMiddleware.handle, chatAdvisorProxyServer)
//criar dúvida
router.post('/problems/:id/doubt',verify, problemProxyServer)

router.get(/adivisor\/doubts(\/)?.*/, verify, AuthorizationMiddleware.handle, chatAdvisorProxyServer)
router.get(/doubts(\/)?.*/, verify, ChatProxyServer)
router.all('*', (req, res) => {
    res.status(404).json({ error: { message: 'Recurso não encontrado' } }); // <== YOUR JSON DATA HERE
});
export default router