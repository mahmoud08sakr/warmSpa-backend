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
    currency: {
        type: String,
        default: 'EGP'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }
},
    {
        timestamps: true
    }
)

const Room = mongoose.model('Room', roomSchema)

export default Room