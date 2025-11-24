import mongoose from 'mongoose';
import { AppError } from '../../errorHandling/AppError.js';
import Feedback from '../../database/model/feedback.model.js';

export const createFeedback = async (feedbackData, userId) => {
    const { user, branch, rating, message, orderId } = feedbackData;

    if (!branch || !branch.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid or missing branch ID', 400);
    }
    if (orderId && !orderId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid order ID', 400);
    }
    if (rating && (rating < 1 || rating > 5)) {
        throw new AppError('Rating must be between 1 and 5', 400);
    }

    console.log(userId.id, "from user id ");

    const payload = {
        user: new mongoose.Types.ObjectId(userId.id),
        branch: new mongoose.Types.ObjectId(branch),
        rating,
        message,
        orderId: orderId ? new mongoose.Types.ObjectId(orderId) : undefined,
    };

    const created = await Feedback.create(payload);
    return created;
};

export const getAllFeedback = async (query = {}) => {
    const { branch, user, page = 1, limit = 10 } = query;
    const filter = {};
    if (branch && branch.match(/^[0-9a-fA-F]{24}$/)) filter.branch = branch;
    if (user && user.match(/^[0-9a-fA-F]{24}$/)) filter.user = user;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const docs = await Feedback.find(filter)
        .populate('user', 'name')
        .populate('branch', 'name')
        .populate('orderId', '_id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v');

    return docs;
};

export const getFeedbackById = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid feedback ID format', 400);
    }

    const doc = await Feedback.findById(id)
        .populate('user', 'name')
        .populate('branch', 'name')
        .populate('orderId', '_id')
        .select('-__v');
    if (!doc) {
        throw new AppError('No feedback found with that ID', 404);
    }
    return doc;
};

export const updateFeedback = async (id, updateData) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid feedback ID format', 400);
    }
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        throw new AppError('Rating must be between 1 and 5', 400);
    }

    const updated = await Feedback.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    )
        .populate('user', 'name')
        .populate('branch', 'name')
        .populate('orderId', '_id')
        .select('-__v');

    if (!updated) {
        throw new AppError('No feedback found with that ID', 404);
    }
    return updated;
};

export const deleteFeedback = async (id) => {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid feedback ID format', 400);
    }
    const deleted = await Feedback.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError('No feedback found with that ID', 404);
    }
    return deleted
};

export const getFeedbackByBranch = async (branchId) => {
    if (!branchId || !branchId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new AppError('Invalid branch ID format', 400);
    }
    const docs = await Feedback.find({ branch: branchId })
        .populate('user', 'name')
        .populate('branch', 'name')
        .sort({ createdAt: -1 })
        .select('-__v');
    return docs;
};
