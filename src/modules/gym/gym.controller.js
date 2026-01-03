import express from "express";
import { auth } from "../../midlleware/auth.js";
import { checkRole } from "../../midlleware/role.js";

const router = express.Router();


// router.get('/get-all-gym-by-branch-id')


export default router;