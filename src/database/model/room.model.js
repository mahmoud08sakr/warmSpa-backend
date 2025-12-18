import mongoose from "mongoose";



let roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true
    },
    isReserved: {
        type: Boolean,
        default: false
    },
    customerName: {
        type: String,
        default: null
    },
    customerPhone: {
        type: String,
        default: null
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    email: {
        type: String
    },
    selectedServide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    assignCaptin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    responsiblePerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Other'],
        default: 'Cash'
    },
    price: {
        type: Number,
    },
    priceAfterDiscount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'EGP'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    }
},
    {
        timestamps: true
    }
);

// Indexes for better query performance
roomSchema.index({ branchId: 1, isReserved: 1 }); // Find available rooms per branch
roomSchema.index({ roomNumber: 1 }); // Quick lookup by room number
roomSchema.index({ branchId: 1 }); // Find all rooms in a branch

const Room = mongoose.model('Room', roomSchema);

export default Room;