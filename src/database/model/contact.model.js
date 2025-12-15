import mongoose from "mongoose";


constContactSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },

    fullName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true,
        maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email format'
        }
    },
    phone: {
        type: String,
        required: [true, 'phone is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
});


const contactModel = mongoose.model('Contact', contactSchema);

export default contactModel;