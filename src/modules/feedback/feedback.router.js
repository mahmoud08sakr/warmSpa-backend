import express from 'express';
import { auth } from '../../midlleware/auth.js';
import { checkRole } from '../../midlleware/role.js';
import {
    createFeedbackHandler,
    getAllFeedbackHandler,
    getFeedbackHandler,
    updateFeedbackHandler,
    deleteFeedbackHandler,
    getFeedbackByBranchHandler
} from './feedback.controller.js';

const router = express.Router();

router.get('/branch/:branchId', getFeedbackByBranchHandler);
router.get('/', getAllFeedbackHandler);
router.get('/:id', getFeedbackHandler);

router.use(auth);
router.post('/', createFeedbackHandler);

router.use(checkRole('Admin', 'SAdmin'));
router.patch('/:id', updateFeedbackHandler);
router.delete('/:id', deleteFeedbackHandler);

export default router;
