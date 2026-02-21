import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
import { authorization } from "../../common/middleware/aurhorization.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { authentication } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";

const userRouter = Router();

userRouter.post("/signup", validation(UV.signUpSchema), US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.post("/", validation(UV.signInschema), US.signIn);
userRouter.get(
  "/profile",
  authentication,
  authorization([roleEnum.user]),
  US.getProfile,
);
userRouter.post("/otp", US.verifyACC);

export default userRouter;
