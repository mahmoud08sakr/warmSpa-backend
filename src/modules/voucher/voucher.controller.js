import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { createVoucher, getVoucherByBranchId, getAllVouchers, updateVoucher, activateVoucher, deactivateVoucher, applyVoucher } from "./voucher.service.js";
const router = express.Router();

router.use(auth);

router.post('/apply-voucher/:serviceId' , auth , async (req , res) => {
    const { serviceId } = req.params;
    const {code} = req.body
    const result = await applyVoucher(serviceId , code);
    return res.status(result.status).json(result.body);
})

router.use(checkRole('Admin', 'SAdmin', "Branch"));

router.post('/create-voucher', async (req, res) => {
    const { code, discountType, discountValue, branchId } = req.body;
    const result = await createVoucher({ code, discountType, discountValue, branchId });
    return res.status(result.status).json(result.body);
})

router.get('/get-voucher-by-branchId/:branchId', async (req, res) => {
    const { branchId } = req.params;
    const result = await getVoucherByBranchId(branchId);
    return res.status(result.status).json(result.body);
})

router.get('/get-all-voucher', async (req, res) => {
    const result = await getAllVouchers();
    return res.status(result.status).json(result.body);
})

router.put('/update-voucher/:voucherId', async (req, res) => {
    const { voucherId } = req.params;
    const { code, discountType, discountValue, branchId } = req.body;
    const result = await updateVoucher(voucherId, { code, discountType, discountValue, branchId });
    return res.status(result.status).json(result.body);
})
router.put('/active-voucher/:voucherId', async (req, res) => {
    const { voucherId } = req.params;
    const result = await activateVoucher(voucherId);
    return res.status(result.status).json(result.body);
})

router.put('/deactive-voucher/:voucherId', async (req, res) => {
    const { voucherId } = req.params;
    const result = await deactivateVoucher(voucherId);
    return res.status(result.status).json(result.body);
})

export default router;
