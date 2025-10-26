import { Router } from "express";
import Branch from "../../database/model/branch.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { StaffModel } from "../../database/model/staff.model.js";
const router = Router();



router.use(auth);
router.use(checkRole('Admin', 'SAdmin'));
router.post('/create-staff', async (req, res) => {
    let { name, branchId, role, phone, nationalId, attachments } = req.body;
    let exsistStaff = await StaffModel.findOne({ nationalId: nationalId });
    if (exsistStaff) {
        if (exsistStaff.isFired) {
            return res.status(400).json({ message: "This staff member has been previously fired. Please contact admin to reinstate." });
        }
        return res.status(400).json({ message: "This staff member already exists in the system" });
    } else {
        let exsistBranch = await Branch.findById(branchId);
        if (!exsistBranch) {
            return res.status(400).json({ message: "The specified branch does not exist" });
        }
        let newStaff = await StaffModel.create({ name, branchId, role, phone, nationalId, attachments });
        if (newStaff) {
            return res.status(201).json({ message: "Staff member created successfully" });
        } else {
            return res.status(400).json({ message: "Failed to create staff member" });
        }
    }
})

router.get('/get-staff-by-branchId/:branchId', async (req, res) => {
    let { branchId } = req.params;
    let staff = await StaffModel.find({ branchId: branchId });
    res.status(200).json({ staff });
})

router.get('/get-all-staff', async (req, res) => {
    let staff = await StaffModel.find();
    res.status(200).json({ staff });
})
router.put('/fire-staff/:staffId', async (req, res) => {
    let { staffId } = req.params;
    let staff = await StaffModel.findById(staffId);
    if (!staff) {
        return res.status(400).json({ message: "Staff member not found" });
    }
    staff.isFired = true;
    await staff.save();
    res.status(200).json({ message: "Staff member fired successfully" });
})
export default router;