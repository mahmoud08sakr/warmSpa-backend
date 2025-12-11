import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import Branch from "../../database/model/branch.model.js";
import Stripe from 'stripe';
import Order from "../../database/model/order.model.js";
import { AppError } from "../../errorHandling/AppError.js";
import Product from "../../database/model/product.model.js";
import { reservationOrderModel } from "../../database/model/reservationOrder.model.js";
import userModel from "../../database/model/user.model.js";

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
                let addReservartioOrderrr = await reservationOrderModel.create({ orderId: createdOrder._id, date: new Date() });
                const userData = await userModel.findById(paymentIntentUpdate.metadata.userId).select('-password')
                userData.points += paymentIntentUpdate.amount_received / 100;
                await userData.save();
                console.log('Order created:', addReservartioOrder);
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
                    await Order.create({
                        sessionId: session.id,
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
                    let addReservartioOrderr = await reservationOrderModel.create({ orderId: createdOrder._id, date: new Date() });
                    const userData = await userModel.findById(paymentIntentUpdate.metadata.userId).select('-password')
                    userData.points += paymentIntentUpdate.amount_received / 100;
                    await userData.save();
                }
                break;

            case 'payment_intent.created':
                const paymentIntentCreated = event.data.object;
                console.log('Payment intent created:', paymentIntentCreated.id);

                await Order.create({
                    sessionId: session.id,
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
                let addReservartioOrder = await reservationOrderModel.create({ orderId: createdOrder._id, date: new Date() });
                const userDataa = await userModel.findById(paymentIntentUpdate.metadata.userId).select('-password')
                userData.points += paymentIntentUpdate.amount_received / 100;
                await userData.save();
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