import express from 'express';
import { checkRole } from '../../midlleware/role.js';
import { auth } from '../../midlleware/auth.js';
import {
    createProductHandler,
    getAllProductsHandler,
    getProductHandler,
    updateProductHandler,
    deleteProductHandler,
    getProductStatsHandler,
    getProductsByBranchHandler
} from './product.controller.js';

const router = express.Router();

router.get('/branch/:branchId', getProductsByBranchHandler);
router.get('/', getAllProductsHandler);
router.get('/:id', getProductHandler);

router.use(auth);

router.use(checkRole('Admin', 'SAdmin'));
router.post('/', createProductHandler);
router.patch('/:id', updateProductHandler);
router.delete('/:id', deleteProductHandler);

export default router;
