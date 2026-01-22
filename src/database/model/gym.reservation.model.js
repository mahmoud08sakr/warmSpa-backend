import mongoose from "mongoose";

const gymReservationSchema = new mongoose.Schema({
    gymId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gym',
        required: true
    },
    reservationData: [{
        userName: { type: String },
        userEmail: { type: String },
        userPhone: { type: String },
        price: { type: Number }
    }],
    date: {
        type: Date,
        default: Date.now
    },
    numberOfSessions: {
        type: Number,
        min: [0, 'Number of sessions must be a positive number']
    },
    subscriptionEndDate: {
        type: Date,
    }
}, { timestamps: true });


export const gymReservationModel = mongoose.model('GymReservation', gymReservationSchema);