import mongoose from "mongoose";


const expenseSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    receipt: {
        type: String
    }
}, { timestamps: true });

// Indexes for better query performance
expenseSchema.index({ branch: 1, status: 1 }); // Find expenses by branch and status
expenseSchema.index({ branch: 1, date: -1 }); // Find branch expenses by date
expenseSchema.index({ status: 1, date: -1 }); // Find pending/approved expenses by date
expenseSchema.index({ date: -1 }); // Sort by date (newest first)
expenseSchema.index({ createdAt: -1 }); // Track when expenses were created

export const expenseAdminModel = mongoose.model('Expense', expenseSchema);
export default expenseAdminModel;












