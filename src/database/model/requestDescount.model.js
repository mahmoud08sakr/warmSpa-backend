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
})

const RequestDiscountModel = mongoose.model("RequestDiscount", requiestDiscountSchema)
export default RequestDiscountModel