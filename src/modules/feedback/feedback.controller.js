import { handleAsyncError } from '../../errorHandling/handelAsyncError.js';
import {
    createFeedback,
    getAllFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    getFeedbackByBranch
} from './feedback.service.js';

export const createFeedbackHandler = handleAsyncError(async (req, res) => {
    const feedback = await createFeedback(req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        data: { feedback }
    });
});

export const getAllFeedbackHandler = handleAsyncError(async (req, res) => {
    const feedback = await getAllFeedback(req.query);
    res.status(200).json({
        status: 'success',
        results: feedback.length,
        data: { feedback }
    });
});

export const getFeedbackHandler = handleAsyncError(async (req, res) => {
    const feedback = await getFeedbackById(req.params.id);
    res.status(200).json({
        status: 'success',
        data: { feedback }
    });
});

export const updateFeedbackHandler = handleAsyncError(async (req, res) => {
    const feedback = await updateFeedback(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { feedback }
    });
});

export const deleteFeedbackHandler = handleAsyncError(async (req, res) => {
    const deleted = await deleteFeedback(req.params.id);
    res.status(204).json({
        status: 'success',
        data: deleted
    });
});

export const getFeedbackByBranchHandler = handleAsyncError(async (req, res) => {
    const feedback = await getFeedbackByBranch(req.params.branchId);
    res.status(200).json({
        status: 'success',
        results: feedback.length,
        data: { feedback }
    });
});
