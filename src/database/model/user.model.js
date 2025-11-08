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
        enum: ["Admin", "User", "branch", "Agent", "MC", "Support", "Moderator"],
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
    }
}, {
    timestamps: true
});

// Index for better query performance (only role index, email is already indexed by unique: true)
userSchema.index({ role: 1 });

const userModel = mongoose.model("User", userSchema);
export default userModel;
