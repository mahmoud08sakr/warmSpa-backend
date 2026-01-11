import { Router } from "express";
import { auth } from "../../midlleware/auth.js";
import Room from "../../database/model/room.model.js";
import ReservationModel from "../../database/model/reservation.model.js";
import { reservationOrderModel } from "../../database/model/reservationOrder.model.js";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
const router = Router();

router.post('/reserve/:branchId/:roomId', auth, handleAsyncError(async (req, res) => {
    let { branchId, roomId } = req.params;
    let { customerName, customerPhone, gender, paymentMethod, currency, price, responsiblePerson, captain, serviceId, priceAfterDiscount } = req.body
    let roomData = await Room.findOne({ _id: roomId, branchId: branchId });
    if (!roomData) {
        return res.status(404).json({ message: "Room not found in the specified branch" });
    }
    if (roomData.isReserved) {
        return res.status(400).json({ message: "Room is already reserved" });
    }
    // priceAfterDiscount ? roomData.priceAfterDiscount = priceAfterDiscount : roomData.priceAfterDiscount = price;
    roomData.isReserved = true;
    roomData.customerName = customerName;
    roomData.customerPhone = customerPhone
    roomData.gender = gender
    roomData.paymentMethod = paymentMethod;
    roomData.currency = currency;
    roomData.startTime = new Date();

    const addreservaion = await ReservationModel.create({ userName: customerName, userEmail: customerPhone, RoomId: roomId, branchId: branchId, gender: gender, reservationDate: new Date(), price, responsiblePerson, captain, serviceId, priceAfterDiscount });
    let addReservartioOrder = await reservationOrderModel.create({ reservationId: addreservaion._id, date: new Date() });
    if (addReservartioOrder && addreservaion) {
        await roomData.save();
    }
    res.status(201).json({ message: 'Reservation created successfully' });
}));

router.post('/end-reservation/:branchId/:roomId', auth, async (req, res) => {
    let { branchId, roomId } = req.params;
    let roomData = await Room.findOne({ _id: roomId, branchId: branchId });
    if (!roomData) {
        return res.status(404).json({ message: "Room not found in the specified branch" });
    }
    if (!roomData.isReserved) {
        return res.status(400).json({ message: "Room is not currently reserved" });
    }
    roomData.isReserved = false;
    roomData.customerName = null;
    roomData.customerPhone = null;
    roomData.gender = null;
    roomData.paymentMethod = null;
    roomData.currency = null;
    roomData.startTime = null;
    await roomData.save();
    res.status(200).json({ message: 'Reservation cancelled successfully' });
});

router.get('/active/:branchId', auth, async (req, res) => {
    let { branchId } = req.params;
    // let { roomId } = req.body
    let activeReservations = await Room.find({ branchId: branchId, isReserved: true });
    // if (roomId) {


    //     let roomData = await Room.findOne({ _id: roomId, branchId: branchId });
    //     if (!roomData) {
    //         return res.status(404).json({ message: "Room not found in the specified branch" });
    //     }
    //     if (roomData.isReserved) {
    //         return res.status(400).json({ message: "Room is already reserved" });
    //     }
    //     console.log(roomData.isReserved);

    //     roomData.priceAfterDiscount = priceAfterDiscount ? priceAfterDiscount : price;
    //     roomData.isReserved = true;
    //     roomData.customerName = customerName;
    //     roomData.customerPhone = customerPhone
    //     roomData.gender = gender
    //     roomData.paymentMethod = paymentMethod;
    //     roomData.currency = currency;

    //     await roomData.save();
    // }
    res.status(200).json({ activeReservations });
});


router.get('/reports-for-branch/:branchId', auth, async (req, res) => {
    let { branchId } = req.params;
    let reservations = await ReservationModel.find({ branchId: branchId }).populate('RoomId');
    res.status(200).json({ reservations });
});


router.post('/reserve-order/:orderId/:roomId', auth, handleAsyncError(async (req, res) => {
    let { orderId, roomId } = req.params;
    let { customerName, customerPhone, gender, paymentMethod, currency, price, responsiblePerson, captain, serviceId, priceAfterDiscount } = req.body
    let roomData = await Room.findOne({ _id: roomId, branchId: branchId });
    if (!roomData) {
        return res.status(404).json({ message: "Room not found in the specified branch" });
    }
    if (roomData.isReserved) {
        return res.status(400).json({ message: "Room is already reserved" });
    }
    // priceAfterDiscount ? roomData.priceAfterDiscount = priceAfterDiscount : roomData.priceAfterDiscount = price;
    roomData.isReserved = true;
    roomData.customerName = customerName;
    roomData.customerPhone = customerPhone
    roomData.gender = gender
    roomData.paymentMethod = paymentMethod;
    roomData.currency = currency;
    roomData.startTime = new Date();

    const addreservaion = await ReservationModel.create({ userName: customerName, userEmail: customerPhone, RoomId: roomId, orderId: orderId, gender: gender, reservationDate: new Date(), price, responsiblePerson, captain, serviceId, priceAfterDiscount });
    let addReservartioOrder = await reservationOrderModel.create({ reservationId: addreservaion._id, date: new Date() });
    if (addReservartioOrder && addreservaion) {
        await roomData.save();
    }
    res.status(201).json({ message: 'Reservation created successfully' });
}));

export default router;