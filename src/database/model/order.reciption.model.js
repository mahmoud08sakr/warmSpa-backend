import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'failed'],
        default: 'unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash_on_delivery', 'bank_transfer'],
        default: 'card'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ branchId: 1, status: 1 }); // Find branch orders by status
orderSchema.index({ phone: 1 }); // Find orders by customer phone
orderSchema.index({ status: 1, paymentStatus: 1 }); // Find orders by status and payment
orderSchema.index({ createdAt: -1 }); // Sort by creation date
orderSchema.index({ branchId: 1, createdAt: -1 }); // Branch orders by date

const OrderDiscountModel = mongoose.model('OrderDiscount', orderSchema);
export default OrderDiscountModel;