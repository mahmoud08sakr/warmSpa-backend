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
        required: true,
        enum: ["Admin", "User", "SAdmin", "Agent", "MC", "Support", "Moderator"],
        default: "User"
    },
    OTP: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for better query performance (only role index, email is already indexed by unique: true)
userSchema.index({ role: 1 });

const userModel = mongoose.model("User", userSchema);
export default userModel;
