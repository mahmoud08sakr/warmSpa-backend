import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["Admin", "User", "Branch", "Operation", "Accountant", "Maneger", "Moderator", "Staff"],
        default: "User"
    },
    OTP: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    city: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        default: "Male"
    },
    points: [{
        numberOfPoints: {
            type: Number,
            default: 0
        },
        date: {
            type: Date,
            default: Date.now
        },
        totalPoints: {
            type: Number,
            default: 0
        }
    }],
    totalPoints: {
        type: Number,
        default: 0
    },
    hourPrice: {
        type: Number,
        default: 0
    },
    mounthlyPrice: [{
        month: {
            type: String,
            enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        },
        salary: {
            type: Number,
            default: 0
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
// email is already indexed by unique: true
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ city: 1, isActive: 1 });
userSchema.index({ createdAt: -1 }); // For registration analytics

const userModel = mongoose.model("User", userSchema);
export default userModel;
