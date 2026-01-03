import mongoose from "mongoose";


const gymSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'Gym name cannot exceed 100 characters']
    },
    phone:{
        type: String,
        trim: true
    },
    branches: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    },
    numberOfSessions: {
        type: Number,
        min: [0, 'Number of sessions must be a positive number']
    },
    subscriptionEndDate: {
        type: Date,
    }
}, {
    timestamps: true
});

gymSchema.index({ name: 1 }); 
gymSchema.index({ name: 'text' }); // Text search for gyms

export const gymModel = mongoose.model('Gym', gymSchema);
