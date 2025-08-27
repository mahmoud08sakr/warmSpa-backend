import { AppError } from "../errorHandling/AppError.js";

export const checkRole = (...roles) => async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }
        const userRole = req.user.role;
        if (roles.includes(userRole)) {
            next();
        } else {
            if (userRole === "Moderator") {
                next();
            } else {
                throw new AppError("You are not authorized to perform this action", 403);
            }
        }
    } catch (error) {
        next(error);
    }
};
