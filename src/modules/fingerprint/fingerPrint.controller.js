import { Router } from "express";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import fingerPrintModel from "../../database/model/fingerPrint.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import userModel from "../../database/model/user.model.js";
import { upload, uploadToCloudinary } from "../../utilts/multer.js";
import { AppError } from "../../errorHandling/AppError.js";
import salaryModel from "../../database/model/salary.model.js";

const router = Router();

router.post('/login', auth, upload.single('image'), uploadToCloudinary(true, "single"), handleAsyncError(async (req, res, next) => {
    const { branchId } = req.body;
    console.log(req.body);

    const userId = req.user.id;
    const image = req.file;
    console.log(req.file);

    const user = await userModel.findById(userId)
    let exsistFingerPrintToday = await fingerPrintModel.find({ userId, loginTime: { $gte: new Date().setHours(0, 0, 0, 0) } })
    for (let i = 0; i < exsistFingerPrintToday.length; i++) {
        if (!exsistFingerPrintToday[i].logoutImage) {
            return next(new AppError("انت سجلت النهاردة بالفعل سجل خروج من الفرع الاول", 400));
        }
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
    if (fingerPrint) {
        res.status(201).json({
            success: true,
            data: fingerPrint
        });
    } else {
        return next(new AppError("حاول مرة اخرى", 404));
    }
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
    }, { new: true });

    let durationInSeconds = (fingerPrint.logoutTime - fingerPrint.loginTime) / 1000;
    let durationInHours = durationInSeconds / 3600;

    // Calculate regular hours (max 8 hours) and overtime
    let regularHours = Math.min(durationInHours, 8);
    let overtimeHours = Math.max(durationInHours - 8, 0);

    // Calculate salary with overtime (1.5x for overtime)
    let regularSalary = user.hourPrice * regularHours;
    let overtimeSalary = user.hourPrice * overtimeHours * 1.5;
    let totalDailySalary = regularSalary + overtimeSalary;

    // Check if salary already exists for this user today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSalary = await salaryModel.findOne({
        userId,
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    if (existingSalary) {
        // Update existing salary record
        existingSalary.DailySalary = totalDailySalary;
        existingSalary.workHours = durationInHours;
        existingSalary.overtimeHours = overtimeHours;
        await existingSalary.save();
    } else {
        // Create new salary record
        await salaryModel.create({
            userId,
            DailySalary: totalDailySalary,
            branchId: fingerPrint.branchId,
            date: new Date(),
            workHours: durationInHours,
            overtimeHours: overtimeHours
        });
    }
    await user.save()
    res.status(200).json({
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

router.get('/calculate-salary/:userId', auth, checkRole("Admin"), handleAsyncError(async (req, res) => {
    const { userId } = req.params;
    const { month, year } = req.query; // Expect month (1-12) and year from query params

    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        })
    }

    // Set date range for the specified month (or current month if not provided)
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // JS months are 0-based
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999); // Last day of month
    console.log(startDate, endDate);

    // Find all unpaid salaries for the user in the specified month
    const salaries = await salaryModel.find({
        userId,
        date: {
            $gte: startDate,
            $lte: endDate
        },
        isPaid: false
    }).populate("branchId", "name location");
    if (salaries.length === 0) {
        return res.status(404).json({
            success: false,
            message: "No unpaid salaries found for this user in the specified month"
        })
    }

    // Calculate total salary for the month
    let totalGrossSalary = 0;
    let totalNetSalary = 0;
    let totalDeductions = 0;
    let totalWorkHours = 0;
    let totalOvertimeHours = 0;

    salaries.forEach(salary => {
        totalGrossSalary += salary.DailySalary;
        totalNetSalary += salary.netSalary || 0;
        totalDeductions += salary.totalDeductions || 0;
        totalWorkHours += salary.workHours || 0;
        totalOvertimeHours += salary.overtimeHours || 0;
    });

    // Mark all salaries as paid
    const paidDate = new Date();
    await salaryModel.updateMany(
        {
            userId,
            date: {
                $gte: startDate,
                $lte: endDate
            },
            isPaid: false
        },
        {
            isPaid: true,
            paidDate: paidDate
        }
    );

    // Update user's monthly price record
    const existingMonthlyRecord = user.mounthlyPrice.find(record =>
        record.date.getMonth() === targetMonth &&
        record.date.getFullYear() === targetYear
    );

    if (existingMonthlyRecord) {
        existingMonthlyRecord.salary = totalNetSalary;
        existingMonthlyRecord.day = salaries.length;
        existingMonthlyRecord.date = new Date();
    } else {
        user.mounthlyPrice.push({
            date: new Date(targetYear, targetMonth, 1),
            salary: totalNetSalary,
            day: salaries.length
        });
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: `Successfully calculated and marked ${salaries.length} salary days as paid`,
        data: {
            userId,
            month: targetMonth + 1,
            year: targetYear,
            summary: {
                totalDays: salaries.length,
                totalGrossSalary,
                totalNetSalary,
                totalDeductions,
                totalWorkHours: Math.round(totalWorkHours * 100) / 100,
                totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
                averageDailySalary: Math.round((totalNetSalary / salaries.length) * 100) / 100,
                paidDate
            },
            salaryDetails: salaries.map(salary => ({
                date: salary.date,
                dailySalary: salary.DailySalary,
                netSalary: salary.netSalary,
                workHours: salary.workHours,
                overtimeHours: salary.overtimeHours,
                branchName: salary.branchId?.name,
                deductions: salary.deduction
            }))
        }
    })
}));

export default router;