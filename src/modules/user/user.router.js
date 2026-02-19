import express from 'express';
import { validation } from '../../utilts/validation.js';
import { signupSchema, loginSchema, resetPasswordSchema, sendOTPSchema, verifyOTPSchema } from './user.validation.js';
import { signup, login, resetpassword, sendOTP, verifyOTP, getAllUsers, getUserById, addStuff, getUsersForAdmin } from './user.service.js';
import { auth } from '../../midlleware/auth.js';
import { checkRole } from '../../midlleware/role.js';
import userModel from '../../database/model/user.model.js';

const router = express.Router();

router.post('/signup', validation({ body: signupSchema }), signup);
router.post('/add-stuff', validation({ body: signupSchema }), addStuff);
router.post('/login', validation({ body: loginSchema }), login);
router.post('/reset-password', auth, validation({ body: resetPasswordSchema }), resetpassword);
router.post('/send-otp', validation({ body: sendOTPSchema }), sendOTP);
router.post('/verify-otp', validation({ body: verifyOTPSchema }), verifyOTP);
router.get('/get-all-users', auth, checkRole("Admin", "SAdmin", "Accountant", "Operation"), getAllUsers)
router.get('/get-all-users-markting', auth, checkRole("Admin", "SAdmin", "Accountant", "Operation"), getUsersForAdmin)
router.post("/upgrade-user-role", async (req, res) => {
    const { userId, role } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(userId, { role }, { new: true });
    res.json(updatedUser);
})

router.get('/get-user-data', auth, getUserById)


export default router;