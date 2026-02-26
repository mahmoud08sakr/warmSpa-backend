import { Router } from 'express';
import { auth } from '../../midlleware/auth.js';
import { tipModel } from '../../database/model/tip.model.js';
import { handleAsyncError } from '../../errorHandling/handelAsyncError.js';
import { checkRole } from '../../midlleware/role.js';
const router = Router();

router.post('/add-tip', auth, handleAsyncError(async (req, res) => {
    let { tip, branchId } = req.body
    let addedTip = await tipModel.insertOne({ tip, branchId })
    if (addedTip) {
        return res.json({ message: "tip added" })
    }
    res.json({ message: "error" })
}))

router.get('/get-all-tips', auth, checkRole("Admin", "Operation", "Accountant" ,"Maneger"), handleAsyncError(async (req, res) => {
    let allTips = await tipModel.find()
    res.json({ message: "done", allTips })
}))

router.get('/get-tip-by-id/:branchId', auth, handleAsyncError(async (req, res) => {
    let { branchId } = req.params
    let tipData = await tipModel.find({ branchId })
    res.json({ message: "done", tipData })
}))

export default router