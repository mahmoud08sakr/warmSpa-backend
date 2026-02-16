import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import Branch from "../../database/model/branch.model.js";

const router = express.Router();


router.post('/add-helper/:branchId', auth, checkRole("Admin", "User", "Branch", "reception" ,"Accountant"), async (req, res) => {
    try {
        let { branchId } = req.params;
        let { userId } = req.body;
        let addedHelper = await Branch.findById(branchId);
        if (!addedHelper) {
            return res.status(404).json({ message: "Branch not found" });
        }
        addedHelper.helper.push({ user: userId });
        await addedHelper.save();
        return res.status(200).json({ message: "Helper added successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;