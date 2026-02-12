import mongoose from 'mongoose';


const reservationSchema = new mongoose.Schema({
    userName: { type: String },
    userEmail: { type: String },
    RoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    captain: { type: String },
    responsiblePerson: { type: String },
    price: { type: Number },
    currency: { type: String, default: 'EGP' },
    paymentMethod: { type: String, enum: ['cash', 'credit', 'instapay', "wallet"], default: 'cash' },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
    reservationDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    priceAfterDiscount: { type: Number },
    serviceFor: {
        type: String,
        enum: ['normal', 'course', 'gym'],
        default: 'normal'
    },
    startTime: { type: Date },
    remainingPayments: {
        type: {
            amount: { type: Number },
            currency: { type: String }
        }
    },
    endTime: { type: Date },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    marketingCompany: { type: String },
}, { timestamps: true });
reservationSchema.index({ branchId: 1, status: 1 }); // Find reservations by branch and status
reservationSchema.index({ branchId: 1, reservationDate: 1 }); // Find reservations by branch and date
reservationSchema.index({ status: 1, reservationDate: 1 }); // Find pending/approved reservations by date
reservationSchema.index({ RoomId: 1, reservationDate: 1 }); // Check room availability
reservationSchema.index({ userEmail: 1, status: 1 }); // Find user reservations
reservationSchema.index({ reservationDate: -1 }); // Sort by date (newest first)
reservationSchema.index({ createdAt: -1 }); // Track when reservations were created

const ReservationModel = mongoose.model('Reservation', reservationSchema);

export default ReservationModel;