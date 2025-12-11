import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Voucher code is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Voucher code cannot exceed 50 characters']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'Discount type is required'],
        default: 'percentage'
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value must be a positive number']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    branchId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

// Indexes for better query performance
// code is already indexed by unique: true
voucherSchema.index({ isActive: 1 }); // Find active vouchers
voucherSchema.index({ branchId: 1, isActive: 1 }); // Find active vouchers per branch
voucherSchema.index({ code: 1, isActive: 1 }); // Validate voucher code

export const voucherModel = mongoose.model('Voucher', voucherSchema);
