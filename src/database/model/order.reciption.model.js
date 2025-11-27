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

const OrderDiscountModel = mongoose.model('OrderDiscount', orderSchema);
export default OrderDiscountModel;