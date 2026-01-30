import Branch from "../../database/model/branch.model.js";
import courseModel from "../../database/model/courses.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import express from "express";
import mongoose from "mongoose";
import { initiatePaymobCoursePayment, handlePaymobCourseWebhook, verifyCoursePayment } from "./courses.payment.service.js";
import ReservationModel from "../../database/model/reservation.model.js";

const router = express.Router();

const calculateTotalSessions = (services) => {
    return services.reduce((total, service) => total + (service.noOfSessions || 0), 0);
};

const calculateDiscount = (totalSessions) => {
    if (totalSessions > 10) {
        return 15;
    } else if (totalSessions > 5) {
        return 5;
    }
    return 0;
};

const calculateTotalPrice = (services) => {
    const subtotal = services.reduce((total, service) => {
        const serviceTotal = (service.servicePrice || 0) * (service.noOfSessions || 0);
        return total + serviceTotal;
    }, 0);

    const totalSessions = calculateTotalSessions(services);

    const discountPercent = calculateDiscount(totalSessions);
    const discountAmount = (subtotal * discountPercent) / 100;
    const totalPrice = subtotal - discountAmount;

    return {
        subtotal,
        totalSessions,
        discountPercent,
        discountAmount,
        totalPrice
    };
};

router.post('/create-course-for-user', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    try {
        const { service, branchId, userName, phone, email } = req.body;

        if (!service || !Array.isArray(service) || service.length === 0) {
            return res.status(400).json({ message: "Service array is required and must contain at least one service" });
        }

        if (!branchId || !userName || !phone) {
            return res.status(400).json({ message: "branchId, userName, and phone are required" });
        }

        const branchData = await Branch.findById(branchId);
        if (!branchData) {
            return res.status(400).json({ message: "Branch not found" });
        }
        for (let i = 0; i < service.length; i++) {
            const svc = service[i];
            if (!svc.serviceName || !svc.serviceId || !svc.servicePrice || !svc.noOfSessions) {
                return res.status(400).json({
                    message: `Service at index ${i} is missing required fields (serviceName, serviceId, servicePrice, noOfSessions)`
                });
            }
            if (!mongoose.Types.ObjectId.isValid(svc.serviceId)) {
                return res.status(400).json({
                    message: `Service at index ${i} has invalid serviceId`
                });
            }
            svc.remainingSessions = svc.noOfSessions;
        }

        // Calculate total price with discount
        const priceCalculation = calculateTotalPrice(service);

        // Create the course
        const courseData = {
            service,
            totalPrice: priceCalculation.totalPrice,
            branchId,
            userName,
            phone,
            email: email || undefined
        };

        const createCourses = await courseModel.create(courseData);
        const addReservationData = await ReservationModel.create({
            userName: userName,
            userEmail: email,
            reservationDate: new Date(),
            price: priceCalculation.totalPrice,
            serviceFor: "course",
        });
        res.status(201).json({
            message: "Course created successfully",
            course: createCourses,
            priceBreakdown: {
                subtotal: priceCalculation.subtotal,
                totalSessions: priceCalculation.totalSessions,
                discountPercent: priceCalculation.discountPercent,
                discountAmount: priceCalculation.discountAmount,
                totalPrice: priceCalculation.totalPrice
            }
        });

    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

/**
 * GET /get-all-courses
 * Get all courses
 * Required role: Admin, SAdmin
 */
router.get('/get-all-courses', auth, checkRole("Admin", "SAdmin"), async (req, res) => {
    try {
        const allCourses = await courseModel.find({}).populate('branchId', 'name');

        res.status(200).json({
            message: "All courses retrieved successfully",
            count: allCourses.length,
            courses: allCourses
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


router.get('/get-user-course-by-id/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        const userCourse = await courseModel.findById(id).populate('branchId', 'name');

        if (!userCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({
            message: "Course retrieved successfully",
            course: userCourse
        });
    } catch (error) {
        console.error("Error fetching course:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

/**
 * PATCH /update-sessions/:id
 * Update remaining sessions for a specific service in a course
 * Required role: Admin, SAdmin, Branch
 */
router.patch('/update-sessions/:id', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    try {
        const { id } = req.params;
        const { serviceId, sessionsUsed } = req.body;

        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        if (!serviceId || !sessionsUsed) {
            return res.status(400).json({ message: "serviceId and sessionsUsed are required" });
        }

        if (sessionsUsed <= 0) {
            return res.status(400).json({ message: "sessionsUsed must be greater than 0" });
        }

        // Find the course
        const courseData = await courseModel.findById(id);

        if (!courseData) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Find the service in the course
        const serviceIndex = courseData.service.findIndex(
            svc => svc.serviceId.toString() === serviceId
        );

        if (serviceIndex === -1) {
            return res.status(404).json({ message: "Service not found in this course" });
        }

        // Check if there are enough remaining sessions
        const currentRemaining = courseData.service[serviceIndex].remainingSessions;

        if (currentRemaining < sessionsUsed) {
            return res.status(400).json({
                message: "Not enough remaining sessions",
                available: currentRemaining,
                requested: sessionsUsed
            });
        }

        // Update remaining sessions
        courseData.service[serviceIndex].remainingSessions = currentRemaining - sessionsUsed;

        // Save the updated course
        const updatedCourse = await courseData.save();

        res.status(200).json({
            message: "Sessions updated successfully",
            course: updatedCourse,
            updatedService: {
                serviceName: updatedCourse.service[serviceIndex].serviceName,
                previousRemaining: currentRemaining,
                sessionsUsed: sessionsUsed,
                newRemaining: updatedCourse.service[serviceIndex].remainingSessions
            }
        });

    } catch (error) {
        console.error("Error updating sessions:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

/**
 * GET /search-user-for-courses
 * Search for courses by user information
 * Required role: Admin, SAdmin, Branch
 */
router.get('/search-user-for-courses', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    try {
        const { userName, email, phone } = req.query;

        const findData = {};

        if (userName) {
            findData.userName = { $regex: userName, $options: 'i' }; // Case-insensitive search
        }
        if (email) {
            findData.email = { $regex: email, $options: 'i' };
        }
        if (phone) {
            findData.phone = { $regex: phone, $options: 'i' };
        }

        if (Object.keys(findData).length === 0) {
            return res.status(400).json({ message: "Please provide at least one search parameter (userName, email, or phone)" });
        }

        const users = await courseModel.find(findData).populate('branchId', 'name');

        if (users.length > 0) {
            res.status(200).json({
                message: "Courses found",
                count: users.length,
                courses: users
            });
        } else {
            res.status(404).json({ message: "No courses found matching the search criteria" });
        }
    } catch (error) {
        console.error("Error searching courses:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

/**
 * DELETE /delete-course/:id
 * Delete a course by ID
 * Required role: Admin, SAdmin
 */
router.delete('/delete-course/:id', auth, checkRole("Admin", "SAdmin"), async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid course ID" });
        }

        const deletedCourse = await courseModel.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({
            message: "Course deleted successfully",
            deletedCourse
        });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// ==================== Payment Routes ====================

/**
 * Initiate Paymob payment for a course
 */
router.post('/payment/initiate', auth, initiatePaymobCoursePayment);

/**
 * Handle Paymob webhook for course payments
 */
router.post('/payment/webhook', handlePaymobCourseWebhook);

/**
 * Verify course payment status
 */
router.get('/payment/verify/:courseId', auth, verifyCoursePayment);

export default router;