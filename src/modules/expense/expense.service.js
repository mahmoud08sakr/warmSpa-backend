import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import Branch from "../../database/model/branch.model.js";
import Stripe from 'stripe';
import Order from "../../database/model/order.model.js";
import { AppError } from "../../errorHandling/AppError.js";
import expenseModel from "../../database/model/expense.model.js";
import { expenseRequestModel } from "../../database/model/expenseRequest.model.js";




export const createExpenseHandler = handleAsyncError(async (req, res) => {
    const { nameExpense, description, amount, date, branch } = req.body;


    if (amount > 10000) {
        const createExpenseRequist = await expenseRequestModel.create({
            nameExpense,
            description,
            amount,
            date,
            branch
        })
        if (createExpenseRequist) {
            return res.status(201).json({ message: "Expense request created successfully wait for approval from admin ", createExpenseRequist });
        }

        throw new AppError('Failed to create expense request', 500);
    }

    const expense = await expenseModel.create({
        nameExpense,
        description,
        amount,
        date,
        branch
    });
    if (expense) {

        res.status(201).json({ message: "Expense created successfully", expense });
    }

    throw new AppError('Failed to create expense', 500);
});
export const getAllExpenseHandler = handleAsyncError (async (req, res) => {
    const expenses = await expenseModel.find().populate('branch', 'name');
    if (expenses) {
        res.status(200).json({ message: "All Expenses", expenses });
    }
    throw new AppError('Failed to get all expenses', 500);
})
export const getAllExpenceForBranch = handleAsyncError(async (req, res) => {
    const expenses = await expenseModel.find({ branch: req.params.id }).populate('branch', 'name');
    if (expenses) {
        res.status(200).json({ message: "All Expenses", expenses });
    }
    throw new AppError('Failed to get all expenses', 500);
})
export const getExpenceRequist = handleAsyncError(async (req, res) => {
    const expenses = await expenseRequestModel.find().populate('branch', 'name');
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