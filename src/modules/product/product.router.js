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
    getProductsByBranchHandler,
    requestDiscout,
    approveDiscountHandler,
    rejectDiscountHandler,
    makeTheOrderAfterApproveDiscountHandler,
    getDiscountRequestHandler
} from './product.controller.js';

const router = express.Router();

router.get('/branch/:branchId', getProductsByBranchHandler);
router.get('/get-all-products', getAllProductsHandler);
router.get('/get-product/:id', getProductHandler);

router.use(auth);
router.post('/requestDiscount', requestDiscout);
router.post('/make-order-after-approve/:id', makeTheOrderAfterApproveDiscountHandler);

router.use(checkRole('Admin', 'SAdmin'));
router.post('/create-product', createProductHandler);
router.get('/get-discount-requests', getDiscountRequestHandler);
router.patch('/update-product/:id', updateProductHandler);
router.delete('/delete-product/:id', deleteProductHandler);
router.put('/approve-discount/:id', approveDiscountHandler);
router.put('/reject-discount/:id', rejectDiscountHandler);
export default router;
