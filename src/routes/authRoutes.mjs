import express from 'express';
import {passwordAuth, registerTOTP, verifyTOTP} from '../controllers/authController.mjs';

const router = express.Router();

router.post('/password', passwordAuth);
router.post('/2FA/register', registerTOTP);
router.post('/2FA/verify', verifyTOTP);

export default router;
