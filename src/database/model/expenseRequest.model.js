import mongoose from "mongoose";


const expenseRequestSchema = new mongoose.Schema({
    nameExpense: {
        type: String,
        required: [true, 'Expense name is required'],
        trim: true,
        maxlength: [100, 'Expense name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Expense description cannot exceed 1000 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Expense amount is required'],
        min: [0, 'Amount must be a positive number']
    },
    date: {
        type: Date,
        default: Date.now
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch reference is required']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, { timestamps: true });

// Indexes for better query performance
expenseRequestSchema.index({ branch: 1, isApproved: 1 }); // Find expense requests by branch and approval status
expenseRequestSchema.index({ branch: 1, date: -1 }); // Find branch expense requests by date
expenseRequestSchema.index({ isApproved: 1, date: -1 }); // Find pending/approved requests by date
expenseRequestSchema.index({ approvedBy: 1 }); // Find requests approved by specific user
expenseRequestSchema.index({ createdAt: -1 }); // Track when requests were created

export const expenseRequestModel = mongoose.model('ExpenseRequest', expenseRequestSchema);