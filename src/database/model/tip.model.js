import mongoose, { Schema } from "mongoose";


const tipSchema = new Schema({
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    tip: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });



export const tipModel = mongoose.model('Tip', tipSchema);