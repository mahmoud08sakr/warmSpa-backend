import { Router } from "express";
import Branch from "../../database/model/branch.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import { StaffModel } from "../../database/model/staff.model.js";
import { upload, uploadToCloudinary } from "../../utilts/multer.js";
const router = Router();


router.use(auth);
router.use(checkRole('Admin', 'SAdmin', "Branch", "Operation", "Accountant"));
router.post('/create-staff', upload.fields([{ name: 'attachments', maxCount: 10 }]), uploadToCloudinary(false, "array"), async (req, res) => {
    let { name, branchId, role, phone, nationalId } = req.body;

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

        // Extract Cloudinary URLs from uploaded files
        let files = [];
        if (req.files && req.files.attachments && req.files.attachments.length > 0) {
            files = req.files.attachments.map(file => file.cloudinaryResult.secure_url);
        }

        let newStaff = await StaffModel.create({
            name,
            branchId,
            role,
            phone,
            nationalId,
            files
        });

        if (newStaff) {
            return res.status(201).json({
                message: "Staff member created successfully",
                staff: newStaff
            });
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
    let { reasonOfFire } = req.body
    let staff = await StaffModel.findById(staffId);
    if (!staff) {
        return res.status(400).json({ message: "Staff member not found" });
    }
    if (staff.isFired) {
        return res.status(400).json({ message: "Staff member is already fired" });
    }
    staff.isFired = true;
    staff.reasonOfFire = reasonOfFire
    staff.reasonOfRehire = ""

    await staff.save();
    res.status(200).json({ message: "Staff member fired successfully" });
})

router.put('/reinstate-staff/:staffId', async (req, res) => {
    let { staffId } = req.params;
    let { reasonOfRehire } = req.body
    let staff = await StaffModel.findById(staffId);
    if (!staff) {
        return res.status(400).json({ message: "Staff member not found" });
    }
    if (!staff.isFired) {
        return res.status(400).json({ message: "Staff member is not fired" });
    }
    staff.isFired = false;
    staff.reasonOfFire = ""
    staff.reasonOfRehire = reasonOfRehire
    await staff.save();
    res.status(200).json({ message: "Staff member reinstated successfully" });
})


router.get('/get-staff-by-id/:staffId', async (req, res) => {
    let { staffId } = req.params;
    let staff = await StaffModel.findById(staffId);
    res.status(200).json({ staff });
})


router.put('/update-staff/:staffId', auth, checkRole('Admin', 'SAdmin', 'Branch'), upload.fields([{ name: 'attachments', maxCount: 10 }]), uploadToCloudinary(false, "array"), async (req, res) => {
    let { staffId } = req.params;
    let { name, branchId, role, phone, nationalId } = req.body
    let staff = await StaffModel.findById(staffId);
    if (!staff) {
        return res.status(400).json({ message: "Staff member not found" });
    }
    staff.name = name;
    staff.branchId = branchId;
    staff.role = role;
    staff.phone = phone;
    staff.nationalId = nationalId;
    if (req.files && req.files.attachments && req.files.attachments.length > 0) {
        staff.attachments = req.files.attachments.map(file => file.cloudinaryResult.secure_url);
    }
    await staff.save();
    res.status(200).json({ message: "Staff member updated successfully" });
})
export default router;