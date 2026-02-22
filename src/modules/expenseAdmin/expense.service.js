import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import Branch from "../../database/model/branch.model.js";
import Stripe from 'stripe';
import Order from "../../database/model/order.model.js";
import { AppError } from "../../errorHandling/AppError.js";
import expenseModel from "../../database/model/expense.model.js";
import { expenseRequestModel } from "../../database/model/expenseRequest.model.js";
import ReservationModel from "../../database/model/reservation.model.js";
import expenseAdminModel from "../../database/model/expense.admin.model.js";




export const createExpenseHandler = handleAsyncError(async (req, res) => {
    const { nameExpense, description, amount, date, branch } = req.body;
    const expense = await expenseAdminModel.create({
        nameExpense,
        description,
        amount,
        date,
        branch,
        status: "approved"
    });
    if (expense) {
        res.status(201).json({ message: "Expense created successfully", expense });
    }
    throw new AppError('Failed to create expense', 500);
}
);
export const getAllExpenseHandler = handleAsyncError(async (req, res) => {
    const expenses = await expenseAdminModel.find().populate('branch', 'name');
    if (expenses) {
        res.status(200).json({ message: "All Expenses", expenses });
    }
    throw new AppError('Failed to get all expenses', 500);
})
export const getAllExpenceForBranch = handleAsyncError(async (req, res) => {
    const expenses = await expenseModel.find({ branch: req.params.id }).populate('branch', 'name');
    if (expenses) {
        return res.status(200).json({ message: "All Expenses", expenses });
    }
    throw new AppError('Failed to get all expenses', 500);
})
export const getExpenceRequist = handleAsyncError(async (req, res) => {
    const expenses = await expenseRequestModel.find().sort('-createdAt')
        .populate('branch', 'name');
    if (expenses) {
        res.status(200).json({ message: "All Expenses", expenses });
    }
    throw new AppError('Failed to get all expenses', 500);
})

export const getExpenceRequistForBranch = handleAsyncError(async (req, res) => {
    const expenses = await expenseRequestModel.find({ branch: req.params.id }).populate('branch', 'name');
    if (expenses) {
        res.status(200).json({ message: "All Expenses", expenses });
    }
    throw new AppError('Failed to get all expenses', 500);
})


export const approveRequest = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const expense = await expenseRequestModel.findById(id);
    if (!expense) {
        return res.status(404).json({ message: "Expense request not found" });
    }
    if (expense.isApproved) {
        return res.status(400).json({ message: "Expense request already approved" });
    }
    expense.isApproved = true;
    expense.approvedBy = req.user.id;
    expense.status = "Approved";
    await expense.save();

    const { nameExpense, description, amount, branch } = expense;
    const Createexpense = await expenseModel.create({
        nameExpense,
        description,
        amount,
        branch,
        status: "approved"
    });
    if (expense) {
        return res.status(201).json({ message: "Expense created successfully", expense });
    }
    await expense.save();
    res.status(200).json({ message: "Expense request approved successfully" });
})

export const cancelRequest = handleAsyncError(async (req, res) => {
    const { id } = req.params;
    const expense = await expenseRequestModel.findById(id);
    if (!expense) {
        return res.status(404).json({ message: "Expense request not found" });
    }
    if (expense.isApproved) {
        return res.status(400).json({ message: "Expense request already approved" });
    }
    let deleteExpense = await expenseRequestModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense request canceled successfully" });
})




