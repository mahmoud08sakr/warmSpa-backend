import { Router } from "express";
import { createPaymentIntent, getOrder, getUserOrders, getAllOrderForAdmin } from "./order.service.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";

const router = Router()

router.post('/create-payment-intent/:branchId/:serviceId', auth, createPaymentIntent);
router.get('/get-order-by-id/:id', auth, getOrder);
router.get('/user/:userId', auth, getUserOrders);
router.get('/get-all-orders-by-admin', auth, checkRole("Admin", "SAdmin", "Branch"), getAllOrderForAdmin);

export default router