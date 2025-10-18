import userModel from '../../database/model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../errorHandling/AppError.js';
import { sendEmail } from '../../utilts/sendEmail.js';
import { resetpasswordTemplate } from '../../template/template.js';
import translations from '../../utilts/translations.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (userId, role) => {
    let signature;
    switch (role) {
        case 'Admin':
            signature = process.env.adminSignature;
            break;
        case 'User':
            signature = process.env.userSignature;
            break;
        case 'SAdmin':
            signature = process.env.sadminSignature;
            break;
        case 'Agent':
            signature = process.env.agentSignature;
            break;
        case 'MC':
            signature = process.env.mcSignature;
            break;
        case 'Support':
            signature = process.env.supportSignature;
            break;
        default:
            signature = process.env.userSignature;
    }

    if (!signature) {
        throw new AppError('JWT signature not configured for this role', 500);
    }

    return jwt.sign({ id: userId, role }, signature, { expiresIn: '24h' });
};

export const signup = async (req, res) => {
    const { name, email, password, phone, role = 'User' } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new AppError(translations.signup.emailExists.en, 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
        name,
        email,
        password: hashedPassword,
        phone,
        role
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    user.password = undefined;

    res.status(201).json({
        status: 'success',
        message: translations.signup.success.en,
        data: {
            user,
            token
        }
    });
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
        throw new AppError(translations.login.emailNotFound.en, 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError(translations.login.invalidCredentials.en, 401);
    }
    let signature;
    switch (user.role) {
        case 'Admin':
            signature = process.env.adminSignature;
            break;
        case 'User':
            signature = process.env.userSignature;
            break;
        case 'MC':
            signature = process.env.mcSignature;
            break;
        case 'Branch':
            signature = process.env.branchSignature;
            break;
        case 'Support':
            signature = process.env.supportSignature;
            break;
        case 'SAdmin':
            signature = process.env.sadminSignature;
            break;
        default:
            return next(new AppError('Unauthorized: Invalid bearer type', 403));
    }

    const token = generateToken(user._id, signature);
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        message: "login successfully",
        data: {
            user,
            token
        }
    });
};
export const resetpassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await userModel.findById(userId).select('+password');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: translations.resetPassword.success.en
    });
};

export const sendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new AppError(translations.sendOTP.emailNotFound.en, 404);
        }

        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
        user.OTP = OTP;
        await user.save();

        let html = resetpasswordTemplate(user, OTP);
        await sendEmail(user.email, html, "undefined", "Verify OTP");

        res.status(200).json({
            status: 'success',
            message: translations.sendOTP.success.en,
        });
    } catch (error) {
        console.error('Error in sendOTP:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Failed to send OTP',
        });
    }
};

export const verifyOTP = async (req, res) => {
    const { OTP, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        throw new AppError('Passwords do not match', 400);
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        throw new AppError(translations.login.emailExists.en, 404);
    }

    if (user.OTP !== OTP) {
        throw new AppError('Invalid OTP', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.OTP = undefined;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Password reset successfully'
    });
};