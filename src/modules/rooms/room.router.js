import { Router } from "express";
import { auth } from "../../midlleware/auth.js";
import Room from "../../database/model/room.model.js";

const router = Router();

router.get('/branch/:branchId', auth, async (req, res) => {
    let { branchId } = req.params;
    let rooms = await Room.find({ branchId: branchId });
    res.status(200).json({ rooms });
});
export default router;