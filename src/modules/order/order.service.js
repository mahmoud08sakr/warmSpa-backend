import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import Branch from "../../database/model/branch.model.js";
import Stripe from 'stripe';
import Order from "../../database/model/order.model.js";
import { AppError } from "../../errorHandling/AppError.js";
import Product from "../../database/model/product.model.js";
import { reservationOrderModel } from "../../database/model/reservationOrder.model.js";
import userModel from "../../database/model/user.model.js";
import { authenticate, registerOrder, requestPaymentKey, validateHmac } from "../../utilts/paymob.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = handleAsyncError(async (req, res, next) => {
    const { branchId, serviceId } = req.params;
    let { name, price, date } = req.body
    const userId = req.user.id;

    const branch = await Branch.findById(branchId);
    if (!branch) {
        return next(new AppError('No branch found with that ID', 404));
    }
    if (!branch.isActive) {
        return next(new AppError('This branch is not active', 400));
    }
    const serviceData = branch.services.find(
        (service) => service.serviceId.toString() === serviceId
    );
    if (!serviceData) {
        return next(new AppError('No service found with that ID', 404));
    }
    const serviceMainData = await Product.findById(serviceId)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'EGP',
                    product_data: {
                        name: name || 'Service Payment',
                    },
                    unit_amount: Math.round(price * 100),

                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `https://warmspa.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/payment/cancel`,

        metadata: {
            userId: userId.toString(),
            branchId,
            serviceId,
            orderType: 'service',
            date: date ? date : Date.now()
        },
    });

    res.status(200).json({
        status: 'success',
        redirectLink: session.url,
    });
})

export const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Event type:', event.type);

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout session completed:', session.id);

                const createdOrder = await Order.create({
                    sessionId: session.id,
                    paymentIntentId: session.payment_intent || session.id,
                    status: 'completed',
                    paymentStatus: 'paid',
                    totalAmount: session.amount_total / 100,
                    items: [{
                        service: session.metadata.serviceId,
                        quantity: 1,
                        price: session.amount_total / 100,
                    }],
                    paymentDetails: session,
                    user: session.metadata.userId,
                    branch: session.metadata.branchId,
                    service: session.metadata.serviceId,
                    orderType: session.metadata.orderType,
                    date: session.metadata.date
                });
                let reservationOrder1 = await reservationOrderModel.create({ orderId: createdOrder._id, date: new Date() });
                const userData = await userModel.findById(session.metadata.userId).select('-password');

                // Initialize points array if it doesn't exist
                if (!userData.points) {
                    userData.points = [];
                }

                // Calculate points to add (1 point per EGP)
                const pointsToAdd = Math.floor(session.amount_total / 100);

                // Create new points entry
                const newPointsEntry = {
                    numberOfPoints: pointsToAdd,
                    totalPoints: pointsToAdd,
                    date: new Date()
                };

                // Add to the beginning of the array (most recent first)
                userData.points.unshift(newPointsEntry);

                console.log('Added points (checkout.session.completed):', pointsToAdd);

                // Save the updated user document
                await userData.save({ validateBeforeSave: true });
                console.log('User points updated successfully');
                console.log('Order created:', reservationOrder1);
                break;

            case 'payment_intent.succeeded':
                const paymentIntentUpdate = event.data.object;
                console.log('Payment intent succeeded:', paymentIntentUpdate.id);

                // Check if order already exists
                const existingOrder = await Order.findOne({
                    paymentIntentId: paymentIntentUpdate.id
                });

                if (existingOrder) {
                    await Order.findOneAndUpdate(
                        { paymentIntentId: paymentIntentUpdate.id },
                        {
                            status: 'completed',
                            paymentStatus: 'paid',
                            $set: { 'paymentDetails': paymentIntentUpdate }
                        },
                        { new: true }
                    );
                } else {
                    const newOrder = await Order.create({
                        paymentIntentId: paymentIntentUpdate.id,
                        status: 'completed',
                        paymentStatus: 'paid',
                        totalAmount: paymentIntentUpdate.amount_received / 100,
                        items: [{
                            service: paymentIntentUpdate.metadata.serviceId,
                            quantity: 1,
                            price: paymentIntentUpdate.amount_received / 100,
                        }],
                        paymentDetails: paymentIntentUpdate,
                        user: paymentIntentUpdate.metadata.userId,
                        branch: paymentIntentUpdate.metadata.branchId,
                        service: paymentIntentUpdate.metadata.serviceId,
                        orderType: paymentIntentUpdate.metadata.orderType,
                    });
                    let reservationOrder2 = await reservationOrderModel.create({ orderId: newOrder._id, date: new Date() });
                    const userData = await userModel.findById(paymentIntentUpdate.metadata.userId).select('-password');

                    // Initialize points array if it doesn't exist
                    if (!userData.points) {
                        userData.points = [];
                    }

                    // Calculate points to add (1 point per EGP)
                    const pointsToAdd = Math.floor(paymentIntentUpdate.amount_received / 100);

                    // Create new points entry
                    const newPointsEntry = {
                        numberOfPoints: pointsToAdd,
                        totalPoints: pointsToAdd,
                        date: new Date()
                    };

                    // Add to the beginning of the array (most recent first)
                    userData.points.unshift(newPointsEntry);

                    console.log('Added points (payment_intent.succeeded):', pointsToAdd);

                    // Save the updated user document
                    await userData.save({ validateBeforeSave: true });
                    console.log('User points updated successfully');
                }
                break;

            case 'payment_intent.created':
                const paymentIntentCreated = event.data.object;
                console.log('Payment intent created:', paymentIntentCreated.id);

                const newPendingOrder = await Order.create({
                    paymentIntentId: paymentIntentCreated.id,
                    status: 'pending',
                    paymentStatus: 'pending',
                    totalAmount: paymentIntentCreated.amount / 100,
                    items: [{
                        service: paymentIntentCreated.metadata.serviceId,
                        quantity: 1,
                        price: paymentIntentCreated.amount / 100,
                    }],
                    paymentDetails: paymentIntentCreated,
                    user: paymentIntentCreated.metadata.userId,
                    branch: paymentIntentCreated.metadata.branchId,
                    service: paymentIntentCreated.metadata.serviceId,
                    orderType: paymentIntentCreated.metadata.orderType,
                });
                let reservationOrder3 = await reservationOrderModel.create({ orderId: newPendingOrder._id, date: new Date() });
                const userDataa = await userModel.findById(paymentIntentCreated.metadata.userId).select('-password');

                // Initialize points array if it doesn't exist
                if (!userDataa.points) {
                    userDataa.points = [];
                }

                // Calculate points to add (1 point per EGP)
                const pointsToAdd2 = Math.floor(paymentIntentCreated.amount / 100);

                // Create new points entry
                const newPointsEntry2 = {
                    numberOfPoints: pointsToAdd2,
                    totalPoints: pointsToAdd2,
                    date: new Date()
                };

                // Add to the beginning of the array (most recent first)
                userDataa.points.unshift(newPointsEntry2);

                console.log('Added points (payment_intent.created):', pointsToAdd2);

                // Save the updated user document
                await userDataa.save({ validateBeforeSave: true });
                console.log('User points updated successfully');
                // Note: Points are awarded only on successful payment, not on creation
                break;

            case 'charge.updated':
                const charge = event.data.object;
                console.log("Charge updated:", charge.id, charge.status);
                break;

            case 'payment_intent.payment_failed':
                const failedPaymentIntent = event.data.object;
                await handlePaymentIntentFailed(failedPaymentIntent);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        // Still return 200 to acknowledge receipt
        res.status(200).json({ received: true, error: error.message });
    }
};
// Helper function to handle successful payment
const handlePaymentIntentSucceeded = async (paymentIntent) => {
    await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        {
            status: 'completed',
            paymentStatus: 'paid',
            $set: { 'paymentDetails': paymentIntent }
        },
        { new: true }
    );
};

// Helper function to handle failed payment
const handlePaymentIntentFailed = async (paymentIntent) => {
    await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        {
            status: 'failed',
            paymentStatus: 'failed',
            $set: { 'paymentDetails': paymentIntent }
        },
        { new: true }
    );
};

// Get order by session ID
export const getOrderBySessionId = handleAsyncError(async (req, res, next) => {
    const { sessionId } = req.params;

    const order = await Order.findOne({ sessionId })
        .populate('user', 'name email')
        .populate('branch', 'name address')
        .populate('items.service', 'name price');

    if (!order) {
        return next(new AppError('No order found with that session ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: order
    });
});

// Get order by payment intent ID
export const getOrderByPaymentIntent = handleAsyncError(async (req, res, next) => {
    const { paymentIntentId } = req.params;

    const order = await Order.findOne({ paymentIntentId })
        .populate('user', 'name email')
        .populate('branch', 'name address')
        .populate('items.service', 'name price');

    if (!order) {
        return next(new AppError('No order found with that payment intent ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: order
    });
});

// Get order by ID
export const getOrder = handleAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('branch', 'name address')
        .populate('items.service', 'name price');

    if (!order) {
        return next(new AppError('No order found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: order
    });
});




// Get user's orders
export const getUserOrders = handleAsyncError(async (req, res) => {
    console.log(req.user);

    const orders = await Order.find({ user: req.user.id })
        .sort('-createdAt')
        .populate('branch', 'name')
        .populate('items.service', 'name price');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
});

export const getAllOrderForAdmin = handleAsyncError(async (req, res) => {
    const orders = await Order.find()
        .sort('-createdAt')
        .populate('branch', 'name')
        .populate('user', 'name email')
        .populate('items.service', 'name price')

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
})

// Redeem user points for discount
export const redeemPoints = handleAsyncError(async (req, res, next) => {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select('-password');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    if (user.points < 10000) {
        return next(new AppError('Insufficient points. Minimum 10,000 points required to redeem', 400));
    }

    // Calculate discount based on formula:
    // 10,000 points = 100 EGP
    // 20,000 points = 300 EGP (100 + 200)
    // 30,000 points = 500 EGP (100 + 400)
    // Formula: discount = 100 + (n-1) * 200, where n = number of 10k increments
    const pointsIncrements = Math.floor(user.points / 10000);
    const discount = 100 + (pointsIncrements - 1) * 200;
    const pointsToRedeem = pointsIncrements * 10000;

    // Deduct points from user
    user.points -= pointsToRedeem;
    await user.save();

    res.status(200).json({
        status: 'success',
        message: 'Points redeemed successfully',
        data: {
            pointsRedeemed: pointsToRedeem,
            discountAmount: discount,
            remainingPoints: user.points
        }
    });
});

export const getOrdersByBranchId = handleAsyncError(async (req, res, next) => {
    const { branchId } = req.params;
    const orders = await Order.find({ branch: branchId })
        .populate('user', 'name email')
        .populate('items.service', 'name price');
    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
});

export const initiatePaymobPayment = handleAsyncError(async (req, res, next) => {
    const { branchId, serviceId } = req.params;
    const { name, price, date } = req.body; // price in EGP
    const userId = req.user.id;

    // 1. Validation
    const branch = await Branch.findById(branchId);
    if (!branch) return next(new AppError('No branch found with that ID', 404));
    if (!branch.isActive) return next(new AppError('This branch is not active', 400));

    const serviceData = branch.services.find(s => s.serviceId.toString() === serviceId);
    if (!serviceData) return next(new AppError('No service found with that ID', 404));

    const user = await userModel.findById(userId);

    // 2. Paymob Authentication
    const authToken = await authenticate();

    // 3. Register Order
    const amountCents = Math.round(price * 100);
    const merchantOrderId = `ORD-${Date.now()}-${userId}`; // Unique internal ID

    const paymobOrderId = await registerOrder(
        authToken,
        amountCents,
        "EGP",
        [{
            name: name || "Service Payment",
            amount_cents: amountCents,
            description: `Service: ${serviceData.name || serviceId}`,
            quantity: 1
        }],
        merchantOrderId
    );

    // 4. Request Payment Key
    const billingData = {
        "apartment": "NA",
        "email": user.email,
        "floor": "NA",
        "first_name": user.name.split(' ')[0] || "User",
        "street": "NA",
        "building": "NA",
        "phone_number": user.phone || "+201000000000",
        "shipping_method": "NA",
        "postal_code": "NA",
        "city": "NA",
        "country": "EG",
        "last_name": user.name.split(' ')[1] || "Name",
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

    // 5. Create Pending Order in DB
    const newOrder = await Order.create({
        paymentIntentId: paymobOrderId, // Storing Paymob Order ID here or in a new field? Using paymentIntentId for consistency
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: price,
        items: [{
            service: serviceId,
            quantity: 1,
            price: price,
        }],
        paymentDetails: {
            paymobOrderId: paymobOrderId,
            merchantOrderId: merchantOrderId
        },
        user: userId,
        branch: branchId,
        service: serviceId,
        orderType: 'service',
        date: date ? date : Date.now()
    });

    await reservationOrderModel.create({ orderId: newOrder._id, date: new Date() });

    // 6. Return Iframe URL
    // const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
    // Returning key and iframe ID to frontend to handle flexibility or just the URL

    res.status(200).json({
        status: 'success',
        paymobUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
        paymentKey
    });
});


export const handlePaymobWebhook = async (req, res) => {
    try {
        const { obj, hmac } = req.body;
        const query = req.query; // If GET callback

        // Paymob sends data in body for POST webhook (Transaction Processed)
        // Check if it's a POST webhook or GET callback
        let data = obj;
        let incomingHmac = hmac;

        if (!data) {
            // Might be GET callback
            data = req.query;
            incomingHmac = req.query.hmac;
        }

        // Validate HMAC
        const isValid = validateHmac({ ...data, hmac: incomingHmac }, process.env.PAYMOB_HMAC);
        if (!isValid) {
            console.error("Paymob HMAC Validation Failed");
            return res.status(400).send("HMAC Validation Failed");
        }

        if (data.success === true || data.success === "true") {
            const paymobOrderId = data.order.id || data.order;

            // Find order by Paymob Order ID (stored in paymentIntentId or paymentDetails)
            const order = await Order.findOne({ 'paymentDetails.paymobOrderId': paymobOrderId });

            if (order && order.status !== 'completed') {
                order.status = 'completed';
                order.paymentStatus = 'paid';
                order.paymentDetails = { ...order.paymentDetails, transaction: data };
                await order.save();

                // Add Points
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
                    console.log(`Points added for User ${user._id}: ${pointsToAdd}`);
                }
            }
        } else {
            console.log("Paymob Transaction Failed or Pending", data.id);
            // Handle failure if needed
        }

        res.status(200).send("Received");
    } catch (error) {
        console.error("Paymob Webhook Error:", error);
        res.status(500).json({ error: error.message });
    }
};
