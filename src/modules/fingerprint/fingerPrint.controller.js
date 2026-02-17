import { Router } from "express";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import fingerPrintModel from "../../database/model/fingerPrint.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import userModel from "../../database/model/user.model.js";
import { upload, uploadToCloudinary } from "../../utilts/multer.js";
import { AppError } from "../../errorHandling/AppError.js";

const router = Router();

router.post('/login', auth, upload.single('image'), uploadToCloudinary(true, "single"), handleAsyncError(async (req, res, next) => {
    const { branchId } = req.body;
    console.log(req.body);

    const userId = req.user.id;
    const image = req.file;
    console.log(req.file);

    const user = await userModel.findById(userId)
    let exsistFingerPrintToday = await fingerPrintModel.findOne({ userId, loginTime: { $gte: new Date().setHours(0, 0, 0, 0) } })
    if (exsistFingerPrintToday) {
        return next(new AppError("انت سجلت النهاردة بالفعل سجل خروج من الفرع الاول", 400));
    }
    if (!user) {
        return next(new AppError("User not found", 404));
    }
    const fingerPrint = await fingerPrintModel.create({
        userId,
        branchId,
        image: req.file.cloudinaryResult.secure_url,
        loginTime: Date.now()
    });
    res.status(201).json({
        success: true,
        data: fingerPrint
    });
}));

router.post('/logout', auth, upload.single('logoutImage'), uploadToCloudinary(true, "single"), handleAsyncError(async (req, res, next) => {
    const { fingerPrintId } = req.body;
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        })
    }
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Image not found"
        })
    }
    const fingerPrint = await fingerPrintModel.findByIdAndUpdate(fingerPrintId, {
        logoutTime: Date.now(),
        logoutImage: req.file.cloudinaryResult.secure_url,
    });

    let duration = (fingerPrint.logoutTime - fingerPrint.loginTime) / 1000;
    // let hours = Math.floor(duration / 3600);
    // console.log(hours, minutes);

    let sallaryDay = user.hourPrice * duration
    let month = new Date().getMonth();
    user.mounthlyPrice.push({
        month,
        salary: sallaryDay
    })
    user.save()
    console.log("sallary", sallaryDay, month, duration);

    res.status(201).json({
        success: true,
        data: fingerPrint
    });
}));

router.get('/get-user-checkIn', auth, async (req, res) => {
    const id = req.user.id;
    const userCheckIn = await fingerPrintModel.find({}).populate("userId").populate("branchId");
    res.status(200).json({
        success: true,
        data: userCheckIn
    })
})

router.get('/get-checkId-by-id/:fingerPrintId', auth, async (req, res) => {
    const fingerPrintId = req.params.fingerPrintId;
    let id = req.user.id;
    const userCheckIn = await fingerPrintModel.findOne({ _id: fingerPrintId, userId: id }).populate("userId").populate("branchId");
    if (!userCheckIn) {
        return next(new AppError("checkIn not found", 404));
    }
    res.status(200).json({
        success: true,
        data: userCheckIn
    })
})

router.get('/get-all-finger-print', auth, checkRole("Admin"), async (req, res) => {
    const fingerPrint = await fingerPrintModel.find({});
    res.status(200).json({
        success: true,
        data: fingerPrint
    })
})
export default router;