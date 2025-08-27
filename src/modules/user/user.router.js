import express from 'express';
import { validation } from '../../utilts/validation.js';
import { signupSchema, loginSchema, resetPasswordSchema, sendOTPSchema, verifyOTPSchema } from './user.validation.js';
import { signup, login, resetpassword, sendOTP, verifyOTP } from './user.service.js';
import { auth } from '../../midlleware/auth.js';

const router = express.Router();

router.post('/signup', validation({ body: signupSchema }), signup);
router.post('/login', validation({ body: loginSchema }), login);
router.post('/reset-password', auth, validation({ body: resetPasswordSchema }), resetpassword);
router.post('/send-otp', validation({ body: sendOTPSchema }), sendOTP);
router.post('/verify-otp', validation({ body: verifyOTPSchema }), verifyOTP);

export default router;
