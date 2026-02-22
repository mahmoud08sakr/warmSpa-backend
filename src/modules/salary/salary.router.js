import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import salaryModel from "../../database/model/salary.model.js";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import userModel from "../../database/model/user.model.js";
const router = express.Router();

router.post('/create-salary', auth, checkRole("Admin", "SAdmin", "Operation", "Accountant"), handleAsyncError(async (req, res) => {
    let { branchId, userId, month } = req.body
    let userData = await userModel.findById(userId)
    if (!userData) {
        return res.status(400).json({ message: "user not found" });
    }
    let filteredMounthlyPrice = userData.mounthlyPrice.filter((item) => item.month === month)
    if (filteredMounthlyPrice.length > 0) {
        let totalSallary = 0
        for (let i = 0; i < filteredMounthlyPrice.length; i++) {
            totalSallary += filteredMounthlyPrice[i].price
        }
    }
    let createSalary = await salaryModel.create({ userId, salary: totalSallary, branchId, date: new Date() }
    )
    if (createSalary) {
        res.status(200).json({ message: "salary created successfully", createSalary })
    } else {
        res.status(400).json({ message: "salary not created" })
    }
}))

router.get('/get-all-salary', auth, checkRole("Admin", "SAdmin", "Operation", "Accountant"), handleAsyncError(async (req, res) => {
    let allSalary = await salaryModel.find().populate("userId").populate("branchId")
    if (allSalary.length > 0) {
        res.status(200).json({ message: "all salary", allSalary })
    } else {
        res.status(400).json({ message: "no salary found" })
    }
}))

router.get('/get-salary-by-id/:id', auth, checkRole("Admin", "SAdmin", "Operation", "Accountant"), handleAsyncError(async (req, res) => {
    let { id } = req.params
    let salary = await salaryModel.findById(id)
    if (salary) {
        res.status(200).json({ message: "salary found", salary })
    } else {
        res.status(400).json({ message: "salary not found" })
    }
}))

router.patch("/add-deduction/:id", auth, checkRole("Admin", "SAdmin", "Operation", "Accountant"), handleAsyncError(async (req, res) => {
    let { id } = req.params
    let { deduction } = req.body
    let updateSalary = await salaryModel.findByIdAndUpdate(id, { $push: { deduction } }, { new: true })
    if (updateSalary) {
        res.status(200).json({ message: "deduction added successfully", updateSalary })
    } else {
        res.status(400).json({ message: "deduction not added" })
    }
}))

export default router