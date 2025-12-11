import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    items: [{
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
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
    paymentIntentId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash_on_delivery', 'bank_transfer'],
        default: 'card'
    },
    shippingAddress: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});
// Indexes for better query performance
orderSchema.index({ user: 1, status: 1 }); // Find user orders by status
orderSchema.index({ branch: 1, status: 1 }); // Find branch orders by status
orderSchema.index({ paymentStatus: 1 }); // Filter by payment status
orderSchema.index({ paymentIntentId: 1 }); // Lookup by payment intent
orderSchema.index({ date: -1 }); // Sort by order date
orderSchema.index({ createdAt: -1 }); // Sort by creation date
orderSchema.index({ branch: 1, createdAt: -1 }); // Branch orders by date

const Order = mongoose.model('Order', orderSchema);
export default Order;