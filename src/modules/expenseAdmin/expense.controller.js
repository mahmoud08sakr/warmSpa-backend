import { Router } from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { approveRequest, cancelRequest, createExpenseHandler, getAllExpenceForBranch, getAllExpenseHandler, getExpenceRequist, getExpenceRequistForBranch } from "./expense.service.js";
import { upload, uploadToCloudinary } from "../../utilts/multer.js";

const router = Router()

router.post('/create-expense-accountant', auth, upload.single("receipt"), uploadToCloudinary(false, "single"), checkRole("Admin", "SAdmin", "Accountant", "Operation"), createExpenseHandler)
router.get('/get-all-expense-for-accountant', auth, checkRole("Admin", "SAdmin", "Operation", "Accountant"), getAllExpenseHandler)
export default router