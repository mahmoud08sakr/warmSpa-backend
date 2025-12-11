import mongoose, { Schema } from "mongoose";

let requiestDiscountSchema = new Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    requiestPrice: {
        type: Number,
        required: true
    },
    reson: {
        type: String,
        required: true
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }],
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true
    },
    reseptionist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

// Indexes for better query performance
requiestDiscountSchema.index({ branchId: 1, status: 1 }); // Find discount requests by branch and status
requiestDiscountSchema.index({ roomId: 1 }); // Find discount requests by room
requiestDiscountSchema.index({ reseptionist: 1, status: 1 }); // Find requests by receptionist
requiestDiscountSchema.index({ status: 1, createdAt: -1 }); // Find pending requests by date
requiestDiscountSchema.index({ branchId: 1, createdAt: -1 }); // Branch requests by date

const RequestDiscountModel = mongoose.model("RequestDiscount", requiestDiscountSchema);
export default RequestDiscountModel;