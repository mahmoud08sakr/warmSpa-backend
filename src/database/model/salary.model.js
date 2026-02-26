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
        required: true
    },
    DailySalary: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    workHours: {
        type: Number,
        required: true,
        min: 0,
        max: 24
    },
    overtimeHours: {
        type: Number,
        default: 0,
        min: 0
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidDate: {
        type: Date
    },
    deduction: [
        {
            quantity: {
                type: Number,
                required: true,
                min: 0
            },
            reason: {
                type: String,
                required: true,
                maxlength: 200
            },
            date: {
                type: Date,
                required: true,
                default: Date.now
            },
            approvedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for net salary
salarySchema.virtual('netSalary').get(function () {
    const totalDeduction = this.deduction.reduce((sum, d) => sum + d.quantity, 0);
    return this.DailySalary - totalDeduction;
});

// Virtual for total deductions
salarySchema.virtual('totalDeductions').get(function () {
    return this.deduction.reduce((sum, d) => sum + d.quantity, 0);
});

// Unique constraint to prevent duplicate salary entries for same user on same date
salarySchema.index({ userId: 1, date: 1 }, { unique: true });

// Index for better query performance
salarySchema.index({ userId: 1 });
salarySchema.index({ branchId: 1 });
salarySchema.index({ date: 1 });

const salaryModel = mongoose.model('Salary', salarySchema);

export default salaryModel;