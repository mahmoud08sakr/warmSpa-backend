import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    service: [{
        serviceName: {
            type: String,
            required: [true, 'Service name is required'],
            trim: true,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'Service reference is required']
        },
        servicePrice: {
            type: Number,
            required: [true, 'Service price is required'],
        },
        noOfSessions: {
            type: Number,
            required: [true, 'Number of sessions is required'],
        },
        remainingSessions: {
            type: Number,
            default: 0
        }
    }],
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch reference is required']
    },
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        maxlength: [100, 'User name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        maxlength: [100, 'Phone number cannot exceed 100 characters']
    },
    email: {
        type: String,
        trim: true,
        maxlength: [100, 'Email cannot exceed 100 characters']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    paymobOrderId: {
        type: String
    },
    paymentMethod: { type: String, enum: ['cash', 'credit', 'instapay', "wallet"], default: 'cash' },

}, {
    timestamps: true
});


const courseModel = mongoose.model('Course', courseSchema);
export default courseModel