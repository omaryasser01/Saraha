import { successResp } from "../../common/utils/resp.success.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { hash, compare } from "../../common/utils/security/hash.security.js";
import { sendEmail } from "../../common/utils/sendEmail.js";
import { generateToken } from "../../common/utils/token.service.js";
import * as db_service from "../../DB/models/db.service.js";
import userModel from "../../DB/models/users.model.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enum/user.enum.js";
import {
  Audience,
  SaltRounds,
  Secret_key,
} from "../../../config/config.service.js";

//======================================Sign UP======================================================

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone, provider } =
    req.body;

  //   if (password !== cPassword) {
  //     throw new Error("password doesn't match", { cause: 400 });
  //   }

  //   if (await db_service.findOne({ model: userModel, filter: { email } })) {
  //     throw new Error("email already exists");
  //   }

  //   const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //   const user = await db_service.create({
  //     model: userModel,
  //     data: {
  //       userName,
  //       email,
  //       password: hash({
  //         plainText: password,
  //         saltRounds: SaltRounds,
  //       }),
  //       age,
  //       gender,
  //       phone: encrypt(phone),
  //       provider,
  //       otp,
  //       otpExpires: Date.now() + 10 * 60 * 1000,
  //     },
  //   });

  //   await sendEmail(email, otp);

  //   successResp({
  //     res,
  //     status: 201,
  //     message: "success SignUp, OTP sent to your email",
  //     data: user,
  //   });
};

//======================================Sign UP with Gmail======================================================

export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: Audience,
  });
  const payload = ticket.getPayload();

  const { email, email_verified, name, picture } = payload;

  let user = await db_service.findOne({ model: userModel, filter: { email } });

  if (!user) {
    user = await db_service.create({
      model: userModel,
      data: {
        email: email,
        confirmed: email_verified,
        userName: name,
        profilePicture: picture,
        provider: providerEnum.Google,
      },
    });
  }

  if (user.provider == providerEnum.System) {
    throw new Error("please login using system", { cause: 400 });
  }

  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    secret_key: Secret_key,
    options: {
      expiresIn: "1d",
      noTimestamp: true,
      jwtid: uuidv4(),
    },
  });

  successResp({ res, message: "success login", data: { access_token } });
};

//======================================Sign In======================================================

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    throw new Error("user not exists");
  }

  const match = compare({ plainText: password, cipherText: user.password });

  if (!match) {
    throw new Error("invaild password");
  }

  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    secret_key: Secret_key,
    options: {
      expiresIn: "1d",
      noTimestamp: true,
      jwtid: uuidv4(),
    },
  });

  successResp({ res, data: { access_token } });
};

//======================================Get User======================================================

export const getProfile = async (req, res, next) => {
  successResp({
    res,
    status: 200,
    message: "done",
    data: { ...req.user._doc, phone: decrypt(req.user.phone) },
  });

  //const { id } = req.params;
  // const { auth } = req.headers;

  // const decode = verifyToken({
  //   token: auth,
  //   secret_key: "kkkey",
  // });
};

//======================================verify OTP======================================================

export const verifyACC = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (otp !== user.otp || user.otpExpires < Date.now()) {
    throw new Error("inValid or expired otp");
  }

  user.otp = null;
  user.otpExpires = null;
  user.confirmed = true;

  await user.save();

  successResp({
    res,
    status: 200,
    message: "Account verified successfully",
  });
};
