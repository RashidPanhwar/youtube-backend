import { Router } from "express";
import { loginUser, logoutUser, userRegister } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.midleware.js";
import { verifyJWT } from "../middlewares/auth.midleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: 'cover_image',
        maxCount: 1
    }
]), userRegister)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT, logoutUser)

export default router