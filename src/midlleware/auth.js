import jwt from 'jsonwebtoken';
import userModel from '../database/model/user.model.js';
import { AppError } from '../errorHandling/AppError.js';

export const auth = async (req, res, next) => {
    try {
        let authorization = req.headers.authorization;

        if (!authorization) {
            return next(new AppError('Unauthorized: No token provided', 403));
        }

        const [bearer, token] = authorization.split(' ') || [];
        if (!bearer || !token) {
            return next(new AppError('Unauthorized: Invalid token format', 403));
        }

        let signature;
        switch (bearer) {
            case 'Admin':
                signature = process.env.ADMIN_SECRET || 'admin-secret';
                break;
            case 'User':
                signature = process.env.USER_SECRET || 'user-secret';
                break;
            case 'Branch':
                signature = process.env.BRANCH_SECRET || 'branch-secret';
                break;
            case 'Support':
                signature = process.env.SUPPORT_SECRET || 'support-secret';
                break;
            case 'Moderator':
                signature = process.env.MODERATOR_SECRET || 'moderator-secret';
                break;
            default:
                return next(new AppError('Unauthorized: Invalid bearer type', 403));
        }
        console.log(signature, "test test ");
        console.log(bearer, "from bearer");



        let decoded;
        try {
            decoded = jwt.verify(token, signature);
            console.log(decoded, "from decoded");
        } catch (error) {
            console.error('JWT verification error:', error);
            return next(new AppError('Unauthorized: Invalid or expired token', 403));
        }

        if (!decoded) {
            return next(new AppError('Unauthorized: Invalid token payload', 403));
        }

        const user = await userModel.findOne({
            $or: [
                { _id: decoded.id },
                { 'subUser._id': decoded.id }
            ]
        });

        if (!user) {
            return next(new AppError('Unauthorized: User not found', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        return next(new AppError('Unauthorized: Authentication failed', 403));
    }
};