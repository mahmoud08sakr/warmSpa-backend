import mongoose from 'mongoose';


const reservationSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    RoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    captain: { type: String },
    responsiblePerson: { type: String },
    price: { type: Number },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    reservationDate: { type: Date, required: true }
}, { timestamps: true });

const ReservationModel = mongoose.model('Reservation', reservationSchema);

export default ReservationModel;