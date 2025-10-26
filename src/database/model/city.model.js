import mongoose from "mongoose";


const citySchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'City name is required'],
        trim: true,
        maxlength: [100, 'City name cannot exceed 100 characters']
    },
    branches: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }]
})

export const cityModel = mongoose.model('City', citySchema);