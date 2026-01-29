import { Router } from "express";
import { createPaymentIntent, getOrder, getOrderBySessionId, getOrderByPaymentIntent, getUserOrders, getAllOrderForAdmin, redeemPoints, getOrdersByBranchId, initiatePaymobPayment, handlePaymobWebhook } from "./order.service.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";

const router = Router()

router.post('/create-payment-intent/:branchId/:serviceId', auth, createPaymentIntent);
router.post('/paymob/initiate/:branchId/:serviceId', auth, initiatePaymobPayment);
router.post('/paymob/webhook', handlePaymobWebhook);
router.get('/get-order-by-id/:id', auth, getOrder);
router.get('/get-order-by-session/:sessionId', getOrderBySessionId);
router.get('/get-order-by-payment-intent/:paymentIntentId', getOrderByPaymentIntent);
router.get('/user/:userId', auth, getUserOrders);
router.get('/get-all-orders-by-admin', auth, checkRole("Admin", "SAdmin", "Branch"), getAllOrderForAdmin);
router.post('/redeem-points', auth, redeemPoints);
router.get('/get-order-by-branch/:branchId', auth, getOrdersByBranchId);

export default router