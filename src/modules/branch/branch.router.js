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
router.get('/city', getAllBranchesCityHandler)
router.get('/get-branch-by-id/:id', getBranchHandler);
router.use(auth);
router.get('/get-branch-details-by-userId', checkRole("Admin", "Branch"), getUserDetails)
// router.use(checkRole('Admin', 'SAdmin'));
router.get('/get-branches-by-Admin', checkRole("Admin", "SAdmin", "Maneger", "Accountant", "Operation"), getAllBranchesByAdminHandler)
router.post('/', checkRole("Admin", "SAdmin", "Operation", "Maneger", "Accountant"), createBranchHandler);
router.patch('/add-service/:branchId', checkRole("Admin", "SAdmin", "Operation", "Maneger", "Accountant"), addService)
router.patch('/:id', checkRole("Admin", "SAdmin", "Operation", "Maneger", "Accountant"), updateBranchHandler);
router.delete('/:id', checkRole("Admin", "SAdmin"), deleteBranchHandler);

export default router;
