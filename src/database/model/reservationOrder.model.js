import mongoose from "mongoose";


const reservationOrderSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const reservationOrderModel = mongoose.model('ReservationOrder', reservationOrderSchema);