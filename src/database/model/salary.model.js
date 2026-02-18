import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    salary: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    deduction: [
        {
            quantity: {
                type: Number,
                required: true
            },
            reason: {
                type: String,
                required: true
            }, date: {
                type: Date,
            }
        }]
}, { timestamps: true });

const salaryModel = mongoose.model('Salary', salarySchema);

export default salaryModel