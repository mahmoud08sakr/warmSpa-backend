import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { createVoucher, getVoucherByBranchId, getAllVouchers, updateVoucher, activateVoucher, deactivateVoucher, applyVoucher, deleteVoucher } from "./voucher.service.js";
const router = express.Router();

router.use(auth);

router.post('/apply-voucher/:serviceId', auth, applyVoucher)

router.use(checkRole('Admin', 'SAdmin', "Branch"));

router.post('/create-voucher', createVoucher)

router.get('/get-voucher-by-branchId/:branchId', getVoucherByBranchId)

router.get('/get-all-voucher', getAllVouchers)

router.put('/update-voucher/:voucherId', updateVoucher)
router.put('/active-voucher/:voucherId', activateVoucher)

router.put('/deactive-voucher/:voucherId', deactivateVoucher)

router.delete('/delete-voucher/:voucherId', deleteVoucher)
export default router;
