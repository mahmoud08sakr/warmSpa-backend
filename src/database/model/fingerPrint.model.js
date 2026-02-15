import mongoose from "mongoose";



const fingerPrintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    loginTime: {
        type: Date,
    },
    logoutTime: {
        type: Date,
    },
    image: {
        type: String,
        required: true
    },
    logoutImage: {
        type: String,
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
    }

})


export default mongoose.model('FingerPrint', fingerPrintSchema);
