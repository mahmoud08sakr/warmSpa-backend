import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import Branch from "../../database/model/branch.model.js";
import courseModel from "../../database/model/courses.model.js";
import Order from "../../database/model/order.model.js";
import { AppError } from "../../errorHandling/AppError.js";
import { authenticate, registerOrder, requestPaymentKey, validateHmac } from "../../utilts/paymob.js";
import userModel from "../../database/model/user.model.js";
import mongoose from "mongoose";

/**
 * Calculate total number of sessions across all services
 * @param {Array} services - Array of service objects
 * @returns {Number} Total number of sessions
 */
const calculateTotalSessions = (services) => {
    return services.reduce((total, service) => total + (service.noOfSessions || 0), 0);
};

/**
 * Calculate discount percentage based on total sessions
 * @param {Number} totalSessions - Total number of sessions
 * @returns {Number} Discount percentage (0, 5, or 15)
 */
const calculateDiscount = (totalSessions) => {
    if (totalSessions > 10) {
        return 15;
    } else if (totalSessions > 5) {
        return 5;
    }
    return 0;
};

/**
 * Calculate total price with discount applied
 * @param {Array} services - Array of service objects
 * @returns {Object} { subtotal, totalSessions, discountPercent, discountAmount, totalPrice }
 */
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

/**
 * Initiate Paymob payment for a course
 * POST /courses/payment/initiate
 */
export const initiatePaymobCoursePayment = handleAsyncError(async (req, res, next) => {
    const { service, branchId, userName, phone, email } = req.body;
    const userId = req.user.id;

    // 1. Validate required fields
    if (!service || !Array.isArray(service) || service.length === 0) {
        return next(new AppError("Service array is required and must contain at least one service", 400));
    }

    if (!branchId || !userName || !phone) {
        return next(new AppError("branchId, userName, and phone are required", 400));
    }

    // 2. Validate branch exists and is active
    const branchData = await Branch.findById(branchId);
    if (!branchData) {
        return next(new AppError("Branch not found", 404));
    }
    if (!branchData.isActive) {
        return next(new AppError("This branch is not active", 400));
    }

    // 3. Validate all services have required fields and valid IDs
    for (let i = 0; i < service.length; i++) {
        const svc = service[i];
        if (!svc.serviceName || !svc.serviceId || !svc.servicePrice || !svc.noOfSessions) {
            return next(new AppError(
                `Service at index ${i} is missing required fields (serviceName, serviceId, servicePrice, noOfSessions)`,
                400
            ));
        }

        if (!mongoose.Types.ObjectId.isValid(svc.serviceId)) {
            return next(new AppError(`Service at index ${i} has invalid serviceId`, 400));
        }

        // Set remainingSessions equal to noOfSessions initially
        svc.remainingSessions = svc.noOfSessions;
    }

    // 4. Calculate total price with discount
    const priceBreakdown = calculateTotalPrice(service);
    const finalPrice = priceBreakdown.totalPrice;

    // 5. Get user data
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // 6. Paymob Authentication
    const authToken = await authenticate();

    // 7. Register Order with Paymob
    const amountCents = Math.round(finalPrice * 100);
    const merchantOrderId = `COURSE-${Date.now()}-${userId}`;

    const paymobOrderId = await registerOrder(
        authToken,
        amountCents,
        "EGP",
        service.map(svc => ({
            name: svc.serviceName,
            amount_cents: Math.round((svc.servicePrice * svc.noOfSessions) * 100),
            description: `${svc.noOfSessions} sessions of ${svc.serviceName}`,
            quantity: 1
        })),
        merchantOrderId
    );

    // 8. Request Payment Key
    const billingData = {
        "apartment": "NA",
        "email": email || user.email,
        "floor": "NA",
        "first_name": userName.split(' ')[0] || "User",
        "street": "NA",
        "building": "NA",
        "phone_number": phone,
        "shipping_method": "NA",
        "postal_code": "NA",
        "city": "NA",
        "country": "EG",
        "last_name": userName.split(' ').slice(1).join(' ') || "Name",
        "state": "NA"
    };

    const paymentKey = await requestPaymentKey(
        authToken,
        paymobOrderId,
        amountCents,
        "EGP",
        billingData,
        process.env.PAYMOB_INTEGRATION_ID
    );

    // 9. Create pending course in database
    const courseData = {
        service,
        totalPrice: finalPrice,
        branchId,
        userName,
        phone,
        email: email || undefined,
        paymentStatus: 'pending',
        paymobOrderId: paymobOrderId.toString()
    };

    const newCourse = await courseModel.create(courseData);

    // 10. Create pending order in database
    const newOrder = await Order.create({
        paymentIntentId: paymobOrderId.toString(),
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: finalPrice,
        items: service.map(svc => ({
            service: svc.serviceId,
            quantity: svc.noOfSessions,
            price: svc.servicePrice * svc.noOfSessions
        })),
        paymentDetails: {
            paymobOrderId: paymobOrderId,
            merchantOrderId: merchantOrderId,
            courseId: newCourse._id
        },
        user: userId,
        branch: branchId,
        orderType: 'course'
    });

    // 11. Link order to course
    newCourse.orderId = newOrder._id;
    await newCourse.save();

    // 12. Return payment URL
    const paymobUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    res.status(200).json({
        status: 'success',
        courseId: newCourse._id,
        paymobUrl,
        paymentKey,
        priceBreakdown
    });
});

/**
 * Handle Paymob webhook for course payments
 * POST /courses/payment/webhook
 */
export const handlePaymobCourseWebhook = async (req, res) => {
    try {
        const { obj, hmac } = req.body;
        const query = req.query;

        // Extract data from POST body or GET query
        let data = obj;
        let incomingHmac = hmac;

        if (!data) {
            data = req.query;
            incomingHmac = req.query.hmac;
        }

        // Validate HMAC
        const isValid = validateHmac({ ...data, hmac: incomingHmac }, process.env.PAYMOB_HMAC);
        if (!isValid) {
            console.error("Paymob HMAC Validation Failed for Course Payment");
            return res.status(400).send("HMAC Validation Failed");
        }

        console.log("Paymob Course Webhook Received:", data);

        if (data.success === true || data.success === "true") {
            const paymobOrderId = data.order.id || data.order;

            // Find course by Paymob Order ID
            const course = await courseModel.findOne({ paymobOrderId: paymobOrderId.toString() });

            if (course && course.paymentStatus !== 'paid') {
                // Update course status
                course.paymentStatus = 'paid';
                await course.save();

                // Find and update order
                const order = await Order.findOne({ 'paymentDetails.paymobOrderId': paymobOrderId });

                if (order) {
                    order.status = 'completed';
                    order.paymentStatus = 'paid';
                    order.paymentDetails = { ...order.paymentDetails, transaction: data };
                    await order.save();

                    // Add Points to user
                    const user = await userModel.findById(order.user);
                    if (user) {
                        if (!user.points) user.points = [];

                        const pointsToAdd = Math.floor(data.amount_cents / 100);
                        const newPointsEntry = {
                            numberOfPoints: pointsToAdd,
                            totalPoints: pointsToAdd,
                            date: new Date()
                        };

                        user.points.unshift(newPointsEntry);
                        await user.save({ validateBeforeSave: false });

                        console.log(`✅ Course payment successful - Points added for User ${user._id}: ${pointsToAdd}`);
                    }
                }

                console.log(`✅ Course ${course._id} payment completed successfully`);
            }
        } else {
            console.log("❌ Paymob Course Transaction Failed or Pending", data.id);

            // Update course to failed
            const paymobOrderId = data.order.id || data.order;
            const course = await courseModel.findOne({ paymobOrderId: paymobOrderId.toString() });

            if (course) {
                course.paymentStatus = 'failed';
                await course.save();
            }
        }

        res.status(200).send("Received");
    } catch (error) {
        console.error("❌ Paymob Course Webhook Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify course payment status
 * GET /courses/payment/verify/:courseId
 */
export const verifyCoursePayment = handleAsyncError(async (req, res, next) => {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError("Invalid course ID", 400));
    }

    const course = await courseModel.findById(courseId)
        .populate('branchId', 'name address')
        .populate('orderId');

    if (!course) {
        return next(new AppError("Course not found", 404));
    }

    res.status(200).json({
        status: 'success',
        course,
        paymentStatus: course.paymentStatus,
        order: course.orderId
    });
});
