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

// Indexes for better query performance
reservationOrderSchema.index({ orderId: 1, reservationId: 1 }); // Compound index for relationship
reservationOrderSchema.index({ orderId: 1 }); // Find all reservations for an order
reservationOrderSchema.index({ reservationId: 1 }); // Find all orders for a reservation
reservationOrderSchema.index({ date: -1 }); // Sort by date

export const reservationOrderModel = mongoose.model('ReservationOrder', reservationOrderSchema);