import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import salaryModel from "../../database/model/salary.model.js";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import userModel from "../../database/model/user.model.js";
const router = express.Router();

router.get('/get-salary-for-user/:id', auth, handleAsyncError(async (req, res) => {
    let { id } = req.params
    let { page = 1, limit = 10, startDate, endDate } = req.query

    // Build query
    let query = { userId: id }

    // Add date range filter if provided
    if (startDate || endDate) {
        query.date = {}
        if (startDate) query.date.$gte = new Date(startDate)
        if (endDate) query.date.$lte = new Date(endDate)
    }

    let skip = (page - 1) * limit

    let salary = await salaryModel.find(query)
        .populate("userId", "name email")
        .populate("branchId", "name location")
        .populate("deduction.approvedBy", "name")
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit))

    let total = await salaryModel.countDocuments(query)

    if (salary.length > 0) {
        let totalSalary = salary.reduce((total, item) => {
            return total + (item.netSalary || 0);
        }, 0);

        let totalGrossSalary = salary.reduce((total, item) => {
            return total + item.DailySalary;
        }, 0);

        let totalDeductions = salary.reduce((total, item) => {
            return total + (item.totalDeductions || 0);
        }, 0);

        res.status(200).json({
            message: "salary records retrieved successfully",
            salary,
            summary: {
                totalSalary,
                totalGrossSalary,
                totalDeductions,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                totalRecords: total
            }
        })
    } else {
        res.status(404).json({ message: "no salary records found for this user" })
    }
})
)
router.post('/add-deduction/:userId', auth, checkRole("Admin"), handleAsyncError(async (req, res) => {
    let { userId } = req.params
    let { deduction } = req.body

    if (!deduction || !deduction.quantity || !deduction.reason) {
        return res.status(400).json({ message: "Invalid deduction data. Quantity and reason are required" })
    }

    if (deduction.quantity <= 0) {
        return res.status(400).json({ message: "Deduction quantity must be positive" })
    }

    let salary = await salaryModel.findOne({ userId })
    if (salary) {
        // Check if deduction exceeds daily salary
        let totalDeductions = salary.deduction.reduce((sum, d) => sum + d.quantity, 0) + deduction.quantity
        if (totalDeductions > salary.DailySalary) {
            return res.status(400).json({ message: "Total deductions cannot exceed daily salary" })
        }

        let addedDeduction = await salaryModel.updateOne({ userId }, {
            $push: {
                deduction: {
                    ...deduction,
                    date: deduction.date || new Date()
                }
            }
        })
        res.status(200).json({ message: "deduction added successfully", addedDeduction })
    } else {
        res.status(400).json({ message: "no salary found for this user" })
    }
}))

// Get salary summary for all users (Admin only)
router.get('/salary-summary', auth, checkRole("Admin"), handleAsyncError(async (req, res) => {
    let { startDate, endDate, branchId } = req.query

    let query = {}
    if (startDate || endDate) {
        query.date = {}
        if (startDate) query.date.$gte = new Date(startDate)
        if (endDate) query.date.$lte = new Date(endDate)
    }
    if (branchId) query.branchId = branchId

    let salaries = await salaryModel.find(query)
        .populate("userId", "name email")
        .populate("branchId", "name location")
        .sort({ date: -1 })

    let summary = {
        totalGrossSalary: 0,
        totalNetSalary: 0,
        totalDeductions: 0,
        totalEmployees: new Set(salaries.map(s => s.userId._id)).size,
        totalWorkHours: 0,
        totalOvertimeHours: 0
    }

    salaries.forEach(salary => {
        summary.totalGrossSalary += salary.DailySalary
        summary.totalNetSalary += salary.netSalary || 0
        summary.totalDeductions += salary.totalDeductions || 0
        summary.totalWorkHours += salary.workHours || 0
        summary.totalOvertimeHours += salary.overtimeHours || 0
    })

    res.status(200).json({
        message: "salary summary retrieved successfully",
        summary,
        details: salaries
    })
}))

// Update salary status (Admin only)
router.patch('/update-salary-status/:salaryId', auth, checkRole("Admin"), handleAsyncError(async (req, res) => {
    let { salaryId } = req.params
    let { status } = req.body

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" })
    }

    let salary = await salaryModel.findByIdAndUpdate(
        salaryId,
        { status },
        { new: true }
    ).populate("userId", "name")

    if (!salary) {
        return res.status(404).json({ message: "Salary record not found" })
    }

    res.status(200).json({
        message: "Salary status updated successfully",
        salary
    })
}))

// Remove deduction (Admin only)
router.delete('/remove-deduction/:salaryId/:deductionId', auth, checkRole("Admin"), handleAsyncError(async (req, res) => {
    let { salaryId, deductionId } = req.params

    let salary = await salaryModel.findByIdAndUpdate(
        salaryId,
        { $pull: { deduction: { _id: deductionId } } },
        { new: true }
    )

    if (!salary) {
        return res.status(404).json({ message: "Salary record not found" })
    }

    res.status(200).json({
        message: "Deduction removed successfully",
        salary
    })
}))

export default router