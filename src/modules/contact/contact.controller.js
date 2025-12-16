import { Router } from 'express';
import contactModel from '../../database/model/contact.model.js';
import { auth } from '../../midlleware/auth.js';
import { checkRole } from '../../midlleware/role.js';
const router = Router();


router.post('/add/contact', auth, async (req, res) => {
    let { fullName, email, phone, message, subject, isRead } = req.body
    let { id } = req.user
    let addedContact = await contactModel.create({ userId: id, fullName, email, phone, message, subject, isRead: "false" })
    if (addedContact) {
        res.status(200).json({ message: "contact added successfully", addedContact })
    }
})


router.get('/get-all-contacts', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    let { id } = req.user
    let allContacts = await contactModel.find({ userId: id })
    if (allContacts) {
        res.status(200).json({ message: "all contacts", allContacts })
    } else {
        res.status(400).json({ message: "no contacts found" })
    }
})

router.get('/get-contact-by-id/:id', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    let { id } = req.params
    let contact = await contactModel.findById(id)
    if (contact) {
        res.status(200).json({ message: "contact", contact })
    } else {
        res.status(400).json({ message: "contact not found" })
    }
})

router.delete('/delete-contact/:id', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    let { id } = req.params
    let deletedContact = await contactModel.findByIdAndDelete(id)
    if (deletedContact) {
        res.status(200).json({ message: "contact deleted successfully", deletedContact })
    } else {
        res.status(400).json({ message: "contact not found" })
    }
})
export default router