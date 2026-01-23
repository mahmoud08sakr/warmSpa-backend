import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { gymModel } from "../../database/model/gym.model.js";
import { handleAsyncError } from "../../errorHandling/handelAsyncError.js";
import { gymReservationModel } from "../../database/model/gym.reservation.model.js";

const router = express.Router();

router.post('/add-gym', handleAsyncError(async (req, res) => {
    let { name, phone, branches } = req.body
    let addedGym = await gymModel.insertMany({ name, phone, branches })
    if (addedGym) {
        res.json({ message: "gym added" })
    } else {
        res.json({ message: "error" })
    }
}))

router.get('/get-all-gym', async (req, res) => {
    let allGym = await gymModel.find()
    res.json({ message: "done", allGym })
})

router.get('/get-gym-by-id/:id', async (req, res) => {
    let { id } = req.params
    let gymData = await gymModel.findById(id)
    res.json({ message: "done", gymData })
})

router.put('/update-gym/:id', async (req, res) => {
    let { id } = req.params
    let { name, phone, branches, price } = req.body
    let updatedGym = await gymModel.findByIdAndUpdate(id, { name, phone, branches, price }, { new: true })
    res.json({ message: "done", updatedGym })
})

router.delete('/delete-gym/:id', async (req, res) => {
    let { id } = req.params
    let deletedGym = await gymModel.findByIdAndDelete(id)
    if (deletedGym) {
        res.json({ message: "done", deletedGym })
    } else {
        res.json({ message: "error in update the gym" })
    }
})

router.post('/add-reservation-gym', async (req, res) => {
    let { gymId, date, reservationData, numberOfSessions, subscriptionEndDate } = req.body
    let addedReservation = await gymReservationModel.insertMany({ gymId, date, reservationData, numberOfSessions, subscriptionEndDate })
    if (addedReservation) {
        res.json({ message: "done", addedReservation })
    } else {
        res.json({ message: "error" })
    }
})

router.post('/add-reservation', async (req, res) => {
    let { gymId, date, reservationData, numberOfSessions, subscriptionEndDate } = req.body
    let addedReservation = await gymReservationModel.insertMany({ gymId, date, reservationData, numberOfSessions, subscriptionEndDate })
    if (addedReservation) {
        res.json({ message: "done", addedReservation })
    } else {
        res.json({ message: "error in add reservation" })
    }
})

router.post('/search-reservation', async (req, res) => {
    const { userName, userEmail, userPhone } = req.body
    let findData = {}
    if (userName) {
        findData['reservationData.userName'] = userName
    }
    if (userEmail) {
        findData['reservationData.userEmail'] = userEmail
    }
    if (userPhone) {
        findData['reservationData.userPhone'] = userPhone
    }
    const reservation = await gymReservationModel.find(findData)
    res.json({ message: "done", reservation })
})

router.put('/update-sessions/:gymReservationId', async (req, res) => {
    let { gymReservationId } = req.body
    let reservationData = await gymReservationModel.findById(gymReservationId)
    if (reservationData) {
        let nowDate = Date.now
        if (reservationData.subscriptionEndDate < nowDate) {
            return res.json({ message: "subscription not expired" })
        }
        if (reservationData.numberOfSessions > 0) {
            reservationData.numberOfSessions = reservationData.numberOfSessions - 1
            let updatedReservation = await gymReservationModel.findByIdAndUpdate(gymReservationId, { numberOfSessions: reservationData.numberOfSessions }, { new: true })
            res.json({ message: "done", updatedReservation })
        } else {
            res.json({ message: "out of sessions" })
        }
    }
})

export default router;