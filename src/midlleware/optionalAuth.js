import jwt from 'jsonwebtoken';
import userModel from '../database/model/user.model.js';
import { config } from '../config/env.js';
import { AppError } from '../errorHandling/AppError.js';
import crypto from 'crypto';

export const optionalAuth = async (req, res, next) => {
    try {
        
        let authorization = req.headers.authorization;
        if (!authorization) {
            const roles = [
                "Admin",
                "Agent",
                "Maintenance_Center",
                "User",
                "Support",
                "SuperAdmin"
            ];

            for (const role of roles) {
                if (req.cookies[role]) {
                    authorization = `${role} ${req.cookies[role]}`;
                    break;
                }
            }
        }

        if (!authorization) {
            if (!req.headers.sessionid) {
                return res.json({ message: "Session id or token is required" });
            }
            return next();
        }

        const [bearer, token] = authorization.split(" ") || [];
        if (!bearer || !token) {
            return next();
        }

        let signature;
        switch (bearer) {
            case config.adminBearer:
                signature = config.adminSignature;
                break;
            case config.agentBearer:
                signature = config.agentSignature;
                break;
            case config.mcBearer:
                signature = config.mcSignature;
                break;
            case config.userBearer:
                signature = config.userSignature;
                break;
            case config.supportBearer:
                signature = config.supportSignature;
                break;
            case config.sadminBearer:
                signature = config.sadminSignature;
                break;
            default:
                return next();
        }
        const decoded = jwt.verify(token, signature);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    } catch (error) {
        next();
    }
};
