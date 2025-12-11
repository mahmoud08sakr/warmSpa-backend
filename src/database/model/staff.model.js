import mongoose from "mongoose";


const staffSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Staff name is required'],
        trim: true,
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Associated branch is required']
    },
    role: {
        type: String,
        required: [true, 'Staff role is required'],
    },
    nationalId: {
        type: String,
        required: [true, 'National ID is required'],
        unique: true,
    },
    attachments: [{
        type: String,
    }],
    isFired: {
        type: Boolean,
        default: false
    },
    reasonOfFire: {
        type: String
    },
    reasonOfRehire: {
        type: String
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
    }
    ,
    files: [{
        type: String,
    }],
}, {
    timestamps: true
});

// Indexes for better query performance
// nationalId is already indexed by unique: true
staffSchema.index({ branchId: 1 });
staffSchema.index({ isFired: 1 });
staffSchema.index({ branchId: 1, isFired: 1 }); // Compound index for finding active staff per branch

export const StaffModel = mongoose.model('Staff', staffSchema);