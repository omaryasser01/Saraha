import { Router } from "express";
import * as US from "./user.service.js";
import { authorization } from "../../common/middleware/aurhorization.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { authentication } from "../../common/middleware/authentication.js";

const userRouter = Router();

userRouter.post("/signup", US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.post("/", US.signIn);
userRouter.get(
  "/profile",
  authentication,
  authorization([roleEnum.admin]),
  US.getProfile,
);
userRouter.post("/otp", US.verifyACC);

export default userRouter;
