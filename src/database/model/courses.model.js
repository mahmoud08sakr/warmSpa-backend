import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        maxlength: [100, 'Course name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Price must be a positive number']
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Branch reference is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Course quantity is required'],
        min: [0, 'Quantity must be a positive number']
    },
    numberOfSessions: [
        {
            name: {
                type: String,
                required: [true, 'Session name is required'],
                trim: true,
                maxlength: [100, 'Session name cannot exceed 100 characters']
            },
            quantity: {
                type: Number,
                required: [true, 'Session quantity is required'],
                min: [0, 'Quantity must be a positive number']
            }
        }
    ],
    userName: {
        type: String,
        required: [true, 'User name is required'],
        trim: true,
        maxlength: [100, 'User name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        maxlength: [100, 'Phone number cannot exceed 100 characters']
    },
    email: {
        type: String,
        trim: true,
        maxlength: [100, 'Email cannot exceed 100 characters']
    }
});


const courseModel = mongoose.model('Course', courseSchema);
export default courseModel