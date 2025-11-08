import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import Branch from "../../database/model/branch.model.js";
import Stripe from 'stripe';
import Order from "../../database/model/order.model.js";
import { AppError } from "../../errorHandling/AppError.js";
import Product from "../../database/model/product.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = handleAsyncError(async (req, res, next) => {
    const { branchId, serviceId } = req.params;
    const userId = req.user.id;

    const branch = await Branch.findById(branchId);
    if (!branch) {
        return next(new AppError('No branch found with that ID', 404));
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
                        name: serviceMainData.name || 'Service Payment',
                    },
                    unit_amount: Math.round(serviceMainData.price * 100),
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/stripe-webhook?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/payment/cancel`,

        metadata: {
            userId: userId.toString(),
            branchId,
            serviceId,
            orderType: 'service',
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
    console.log("from the stripe data");

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

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            const createdOrder = await Order.create({
                paymentIntentId: paymentIntent.id,
                status: 'pending',
                paymentStatus: 'pending',
                paymentDetails: paymentIntent,
                user: paymentIntent.metadata.userId,
                branch: paymentIntent.metadata.branchId,
                service: paymentIntent.metadata.serviceId,
                orderType: paymentIntent.metadata.orderType,
            });
            await handlePaymentIntentSucceeded(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPaymentIntent = event.data.object;
            await handlePaymentIntentFailed(failedPaymentIntent);
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
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
    const orders = await Order.find({ user: req.user._id })
        .sort('-createdAt')
        .populate('branch', 'name')
        .populate('items.service', 'name price');

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: orders
    });
});