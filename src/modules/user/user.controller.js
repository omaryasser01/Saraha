import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
import { authorization } from "../../common/middleware/aurhorization.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { authentication } from "../../common/middleware/authentication.js";
import { validation } from "../../common/middleware/validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
import messageRouter from "../messages/message.controller.js";

const userRouter = Router({ caseSensitive: true });

userRouter.use("/:userID/messages", messageRouter);

userRouter.post(
  "/signup",
  multer_host(multer_enum.image).single("attachment"),
  US.signUp,
);

userRouter.post("/signup/gmail", US.signUpWithGmail);

userRouter.post("/", validation(UV.signInschema), US.signIn);

userRouter.get(
  "/profile",
  authentication,
  authorization([roleEnum.user]),
  US.getProfile,
);

userRouter.post("/otp", validation(UV.verifyOTPSchema), US.verifyACC);

userRouter.post("/resend-otp", US.resendOTP);

userRouter.get("/refresh_token", US.refreshToken);

userRouter.get(
  "/profile/:id",
  validation(UV.shareProfileschema),
  US.shareProfile,
);

userRouter.patch(
  "/updateuser",
  validation(UV.updateUserSchema),
  authentication,
  US.updateProfile,
);

userRouter.patch(
  "/updatePassword",
  validation(UV.updatePassSchema),
  authentication,
  US.updatePassword,
);

userRouter.post("/logOut", authentication, US.logOut);

userRouter.patch("/forgetPassword", US.forgetPass);

userRouter.patch(
  "/resetPassword",
  validation(UV.resetPassSchema),
  US.resetPass,
);

export default userRouter;
