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
            case 'Manege':
                signature = process.env.SIGNATURE || 'moderator-secret';
                break;
            case "Operation":
                signature = process.env.SIGNATURE || 'operation-secret';
                break;
            default:
                return next(new AppError('Unauthorized: Invalid bearer type', 403));
        }
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