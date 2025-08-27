import { Router } from "express";
import { createPaymentIntent, getOrder, getUserOrders } from "./order.service.js";
import { auth } from "../../midlleware/auth.js";

const router = Router()

router.post('/create-payment-intent/:branchId/:serviceId', auth, createPaymentIntent);
router.get('/:id', getOrder);
router.get('/user/:userId', getUserOrders);

export default router