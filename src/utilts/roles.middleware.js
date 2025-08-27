import { AppError } from "../errorHandling/AppError.js";
import { handleAsyncError } from "../errorHandling/handelAsyncError.js";

export const IsApproved = (permissions) => handleAsyncError(async (req, res, next) => {

    if (req.user.role === 'Admin' || req.user.role === 'Agent') {
        return next()
    }
    if (req.user.permissions.some(permission => permissions.includes(permission))) {
        return next();
    }
    next(new AppError('You are not authorized to perform this action', 403));
})