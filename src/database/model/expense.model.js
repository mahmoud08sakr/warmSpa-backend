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
    }
}, { timestamps: true });

export const expenseModel = mongoose.model('Expense', expenseSchema);
export default expenseModel;












