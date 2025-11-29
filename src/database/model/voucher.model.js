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
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

export const voucherModel = mongoose.model('Voucher', voucherSchema);
