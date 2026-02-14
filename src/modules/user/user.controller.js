import { Router } from "express";
import * as US from "./user.service.js";
import { authentication } from "../../common/middleware/authentication.js";

const userRouter = Router();

userRouter.post("/signup", US.signUp);
userRouter.post("/", US.signIn);
userRouter.get("/profile", authentication, US.getProfile);
userRouter.post("/otp", US.verifyACC);

export default userRouter;
