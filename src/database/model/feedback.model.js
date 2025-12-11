import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Feedback message cannot exceed 1000 characters']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }
}, { timestamps: true });

// Indexes for better query performance
feedbackSchema.index({ branch: 1, rating: 1 }); // Find feedback by branch and rating
feedbackSchema.index({ user: 1, createdAt: -1 }); // Find user's feedback history
feedbackSchema.index({ orderId: 1 }); // Find feedback for specific order
feedbackSchema.index({ rating: 1 }); // Filter by rating
feedbackSchema.index({ createdAt: -1 }); // Sort by date (newest first)

export const feedbackModel = mongoose.model('Feedback', feedbackSchema);
export default feedbackModel;