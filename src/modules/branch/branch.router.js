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
    getUserDetails,
    getAllBranchesCityHandler,
    getAllBranchesByAdminHandler
} from './branch.controller.js';
import { getAllBranchesByCity } from './branch.service.js';

const router = express.Router();

router.get('/within/distance', getBranchesWithinHandler);
router.get('/', getAllBranchesHandler);
router.get('/get-user-data' , getUserData)
router.get('/city' ,getAllBranchesCityHandler)
router.get('/get-branch-by-id/:id', getBranchHandler);
router.use(auth);
router.get('/get-branch-details-by-userId', checkRole("Admin", "Branch"), getUserDetails)
router.use(checkRole('Admin', 'SAdmin'));
router.get('/get-branches-by-Admin',getAllBranchesByAdminHandler )
router.post('/', createBranchHandler);
router.patch('/add-service/:branchId', addService)
router.patch('/:id', updateBranchHandler);
router.delete('/:id', deleteBranchHandler);

export default router;
