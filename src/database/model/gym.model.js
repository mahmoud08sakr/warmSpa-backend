import mongoose from "mongoose";


const gymSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Gym name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        trim: true
    },
    branches: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    },
    price: {
        type: [Number],
        default: [500, 800, 1200, 1600, 2000],
    }
}, {
    timestamps: true
});

gymSchema.index({ name: 1 });
gymSchema.index({ name: 'text' }); // Text search for gyms

export const gymModel = mongoose.model('Gym', gymSchema);
