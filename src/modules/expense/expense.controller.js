import { Router } from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { approveRequest, cancelRequest, createExpenseHandler, getAllExpenceForBranch, getAllExpenseHandler, getExpenceRequist, getExpenceRequistForBranch } from "./expense.service.js";

const router = Router()

router.post('/create-expense', auth, checkRole("Admin", "SAdmin", "reception", "Branch", "Operation"), createExpenseHandler)
router.get('/get-all-expense-for-admin', auth, checkRole("Admin", "SAdmin", "Operation"), getAllExpenseHandler)
router.get('/get-all-expense-for-reception/:id', auth, checkRole("reception", "Admin", "Branch", "Operation"), getAllExpenceForBranch)
router.get('/get-all-expense-request-for-admin', auth, checkRole("Admin", "SAdmin", "Operation"), getExpenceRequist)
router.get('/get-all-expense-request-for-reception/:id', auth, checkRole("reception", "Admin", "Branch", "Operation"), getExpenceRequistForBranch)
router.put('/approve-expense-request/:id', auth, checkRole("Admin", "SAdmin", "Operation"), approveRequest)
router.put('/reject-expense-request/:id', auth, checkRole("Admin", "SAdmin", "Operation"), cancelRequest

)
export default router