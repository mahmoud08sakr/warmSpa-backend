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
    addService
} from './branch.controller.js';

const router = express.Router();

router.get('/within/distance', getBranchesWithinHandler);
router.get('/', getAllBranchesHandler);
router.get('/:id', getBranchHandler);
router.use(auth);
router.use(checkRole('Admin', 'SAdmin'));
router.post('/', createBranchHandler);
router.patch('/add-service/:branchId',addService)
router.patch('/:id', updateBranchHandler);
router.delete('/:id', deleteBranchHandler);

export default router;
