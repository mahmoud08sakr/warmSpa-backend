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
    reservationDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

// Indexes for better query performance
reservationSchema.index({ branchId: 1, status: 1 }); // Find reservations by branch and status
reservationSchema.index({ branchId: 1, reservationDate: 1 }); // Find reservations by branch and date
reservationSchema.index({ status: 1, reservationDate: 1 }); // Find pending/approved reservations by date
reservationSchema.index({ RoomId: 1, reservationDate: 1 }); // Check room availability
reservationSchema.index({ userEmail: 1, status: 1 }); // Find user reservations
reservationSchema.index({ reservationDate: -1 }); // Sort by date (newest first)
reservationSchema.index({ createdAt: -1 }); // Track when reservations were created

const ReservationModel = mongoose.model('Reservation', reservationSchema);

export default ReservationModel;