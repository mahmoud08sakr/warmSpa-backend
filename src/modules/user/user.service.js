import userModel from '../../database/model/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../errorHandling/AppError.js';
import { sendEmail } from '../../utilts/sendEmail.js';
import { resetpasswordTemplate } from '../../template/template.js';
import translations from '../../utilts/translations.js';
import { handleAsyncError } from '../../errorHandling/handelAsyncError.js';
import { StaffModel } from '../../database/model/staff.model.js';
import Branch from '../../database/model/branch.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (userId, role) => {
    let signature;
    switch (role) {
        case 'Admin':
            signature = process.env.SIGNATURE || 'admin-secret';
            break;
        case 'User':
            signature = process.env.SIGNATURE || 'user-secret';
            break;
        case 'Branch':
            signature = process.env.SIGNATURE || 'branch-secret';
            break;
        case 'Accountant':
            signature = process.env.SIGNATURE || 'support-secret';
            break;
        case 'Maneger':
            signature = process.env.SIGNATURE || 'moderator-secret';
            break;
        case "Operation":
            signature = process.env.SIGNATURE || "operation-secret";
            break;
        case "Moderator":
            signature = process.env.SIGNATURE || "moderator-secret";
            break;
        case "Staff":
            signature = process.env.SIGNATURE || "staff-secret";
            break;
        default:
            throw new AppError('Invalid role', 500);
    }

    if (!signature) {
        throw new AppError('JWT signature not configured for this role', 500);
    }

    return jwt.sign({ id: userId, role }, signature);
};

export const signup = handleAsyncError(async (req, res) => {
    const { name, email, password, phone, city, gender } = req.body;
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
        city, gender
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
});

export const addStuff = handleAsyncError(async (req, res) => {
    const { name, email, password, phone, city, gender } = req.body;
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
        city,
        gender,
        role: "Staff"
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
})

// Using the existing generateToken function that's already defined at the top of the file

export const login = handleAsyncError(async (req, res, next) => {
    try {
        const rawEmail = req.body?.email ?? req.body?.userEmail ?? req.body?.Email
        const password = req.body?.password

        if (!rawEmail) {
            return next(new AppError('email is required', 400));
        }
        if (!password) {
            return next(new AppError('password is required', 400));
        }

        const email = String(rawEmail).trim().toLowerCase()
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                status: 'error',
                message: translations.login.emailNotFound.en,
            })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: translations.login.invalidCredentials.en,
            })
        }
        // Generate token using the updated generateToken function
        const token = generateToken(user._id, user.role);
        user.password = undefined;
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                user,
                token: `${token}` // Prefix token with role for auth middleware
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        next(new AppError('An error occurred during login', 500));
    }
});
export const resetpassword = handleAsyncError(async (req, res) => {
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
});

export const sendOTP = handleAsyncError(async (req, res) => {
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
});

export const verifyOTP = handleAsyncError(async (req, res) => {
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
});


export const getAllUsers = handleAsyncError(async (req, res) => {
    try {
        const users = await userModel.find({ role: "Staff" }).select('-password -OTP -__v');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users: users || []
            }
        });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
        });
    }
})

export const getUsersForAdmin = handleAsyncError((async (req, res) => {
    try {
        const users = await userModel.find({ role: "User" }).select('-password -OTP -__v');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users: users || []
            }
        });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
        });
    }
}))


export const getUserById = handleAsyncError(async (req, res) => {
    let { id } = req.user
    const userData = await userModel.findById(id).select('-password')
    if (!userData) {
        throw new AppError('user not found', 404)
    }
    const now = Date.now()
    const points = Array.isArray(userData.points) ? userData.points : []
    let availablePoints = 0
    for (let i = 0; i < points.length; i++) {
        const p = points[i] || {}
        const pointDate = p.date ? new Date(p.date).getTime() : 0
        if (pointDate <= now) {
            availablePoints += Number(p.numberOfPoints) || 0
        }
    }

    userData.totalPoints = availablePoints
    res.json({ message: "user found successfully", userData })
})


export const getAllStaff = handleAsyncError(async (req, res) => {
    try {
        let userData = await userModel.findById(req.user.id)
        if (userData.role == "Maneger") {
            let branchId = await Branch.findOne({ manegedBy: req.user.id })
            console.log(branchId);
            
            const users = await StaffModel.find({ role: "Staff", branchId: branchId._id }).select('-password -OTP -__v');
            return res.status(200).json({
                status: 'success',
                results: users.length,
                data: {
                    users: users || []
                }
            });
        }
        const users = await userModel.find({ role: "Staff" }).select('-password -OTP -__v');
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users: users || []
            }
        });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch users',
        });
    }
})
