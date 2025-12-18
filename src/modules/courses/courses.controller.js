import Branch from "../../database/model/branch.model.js";
import courseModel from "../../database/model/courses.model.js";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";
import express from "express";

const router = express.Router();

router.post('/create-course-for-user', auth, checkRole("Admin", "SAdmin", "Branch"), async (req, res) => {
    let { price, branchId, quantity, userName, phone, email } = req.body
    let branchData = await Branch.findById(branchId)
    if (!branchData) {
        return res.status(400).json({ message: "branch not found" });
    }
    let createCourses = await courseModel.create({ price, branchId, quantity, userName, phone, email })
    let course = await createCourses.save()
    if (course) {
        res.status(200).json({ message: "course created successfully", course })
    } else {
        res.status(400).json({ message: "course not created" })
    }
})

router.get('/get-all-courses', auth, checkRole("Admin", "SAdmin"), async (req, res) => {
    let allCourses = await courseModel.find({})
    if (allCourses) {
        res.status(200).json({ message: "all courses", allCourses })
    } else {
        res.status(400).json({ message: "no courses found" })
    }
})

router.get('/get-user-course-by-id/:id', auth, async (req, res) => {
    let { id } = req.params
    let userCourses = await courseModel.findById(id)
    if (userCourses) {
        res.status(200).json({ message: "user courses", userCourses })
    } else {
        res.status(400).json({ message: "no user courses found" })
    }
})

router.patch('/update-quantity/:id', auth, checkRole("Admin", "SAdmin" , "Branch"), async (req, res) => {
    let { id } = req.params
    let { quantity } = req.body
    let courseData = await courseModel.findById(id)
    let condition = courseData.quantity >= quantity
    if (condition) {
        let updatedQuantity = courseData.quantity - quantity
        console.log(courseData.quantity  , "quantity of the course");
        console.log(quantity , "from body");
        console.log(updatedQuantity , "updated quantity");
        
        let updatedCourse = await courseModel.findByIdAndUpdate(id, { quantity:updatedQuantity }, { new: true })
        if (updatedCourse) {
            res.status(200).json({ message: "course updated successfully", updatedCourse })
        } else {
            res.status(400).json({ message: "course not found" })
        }
    } else {
        res.status(400).json({ message: "quantity not enough", waring: "dont try this again" })
    }
})

router.get('/search-user-for-courses', auth, checkRole("Admin", "SAdmin" , "Branch"), async (req, res) => {
    let { userName, email, phone } = req.query
    let findData = {}
    if (userName) {
        findData.userName = userName
    }
    if (email) {
        findData.email = email
    }
    if (phone) {
        findData.phone = phone
    }
    let user = await courseModel.find({ findData })
    if (user) {
        res.status(200).json({ message: "user found", user })
    } else {
        res.status(400).json({ message: "user not found" })
    }
})

router.delete('/delete-course/:id', auth, checkRole("Admin", "SAdmin"), async (req, res) => {
    let { id } = req.params
    let deletedCourse = await courseModel.findByIdAndDelete(id)
    if (deletedCourse) {
        res.status(200).json({ message: "course deleted successfully", deletedCourse })
    } else {
        res.status(400).json({ message: "course not found" })
    }
})

export default router