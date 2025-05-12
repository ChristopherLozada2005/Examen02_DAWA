import express from "express"
import { signup, signin, getProfile } from "../controllers/auth.controller.js"
import { checkDuplicateEmail, checkRolesExisted } from "../middleware/verifySignup.js"
import { verifyToken } from "../middleware/authJwt.js"

const router = express.Router()

router.post("/signup", [checkDuplicateEmail, checkRolesExisted], signup)

router.post("/signin", signin)
router.get("/profile", verifyToken, getProfile)

export default router
