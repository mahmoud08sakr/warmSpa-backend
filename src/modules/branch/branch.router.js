import express from 'express';
import { checkRole } from '../../midlleware/role.js';
import { auth } from '../../midlleware/auth.js';
import {
    createBranchHandler,
    getAllBranchesHandler,
    getBranchHandler,
    updateBranchHandler,
    deleteBranchHandler,
    getBranchesWithinHandler,
    addService,
    getUserDetails
} from './branch.controller.js';

const router = express.Router();

router.get('/within/distance', getBranchesWithinHandler);
router.get('/', getAllBranchesHandler);
router.get('/get-branch-by-id/:id', getBranchHandler);
router.use(auth);
router.get('/get-branch-details-by-userId', checkRole("Admin", "Branch"), getUserDetails)
router.use(checkRole('Admin', 'SAdmin'));
router.post('/', createBranchHandler);
router.patch('/add-service/:branchId', addService)
router.patch('/:id', updateBranchHandler);
router.delete('/:id', deleteBranchHandler);

export default router;
