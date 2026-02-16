
import { Router } from "express";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import { reservationOrderModel } from "../../database/model/reservationOrder.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";

const router = Router();




router.get('/get-reservation-and-order', auth, checkRole("Admin", "SAdmin", "Operation"), handleAsyncError(async (req, res) => {
    let data = await reservationOrderModel.find().populate('reservationId').populate('orderId');
    res.status(200).json({ data });
}))



export default router