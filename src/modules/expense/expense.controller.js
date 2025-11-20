import { Router } from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { createExpenseHandler, getAllExpenceForBranch, getAllExpenseHandler, getExpenceRequist, getExpenceRequistForBranch } from "./expense.service.js";

const router = Router()

router.post('/create-expense', auth, checkRole("Admin", "SAdmin", "reception" , "Branch"), createExpenseHandler)
router.get('/get-all-expense-for-admin', auth, checkRole("Admin", "SAdmin",), getAllExpenseHandler)
router.get('/get-all-expense-for-reception/:id', auth, checkRole("reception", "Admin", "Branch"), getAllExpenceForBranch)
router.get('/get-all-expense-request-for-admin', auth, checkRole("Admin", "SAdmin"), getExpenceRequist)
router.get('/get-all-expense-request-for-reception/:id', auth, checkRole("reception", "Admin", "Branch"), getExpenceRequistForBranch)

export default router