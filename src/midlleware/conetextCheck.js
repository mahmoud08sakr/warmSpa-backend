import userModel from '../database/model/user.model.js';

export const checkContext = async (req, res, next) => {
    try {
        const { userId } = req.body; 
        const { _id, role, context } = req.user;
        if (!['Agent', 'MC'].includes(role)) {
            return res.status(403).json({ message: 'Only Agent or MC can perform this action' });
        }
        const targetUser = await userModel.findById(userId);
        if (!targetUser || targetUser.role !== 'Moderator') {
            return res.status(400).json({ message: 'Target user must be a Moderator' });
        }
        if (targetUser.context.contextId.toString() !== _id.toString() || targetUser.context.contextType !== role) {
            return res.status(403).json({ message: 'Moderator is not in your context' });
        }
        next();
    } catch (err) {
        next(err);
    }
};