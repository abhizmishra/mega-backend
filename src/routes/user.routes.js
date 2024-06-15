import { Router } from "express";
import { regiterUser } from "../controllers/user.controller.js";


const router = Router()

router.route("/register").post(regiterUser)

export default router