import { successResp } from "../../common/utils/resp.success.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { hash, compare } from "../../common/utils/security/hash.security.js";
import { sendEmail } from "../../common/utils/sendEmail.js";
import {
  generateToken,
  verifyToken,
} from "../../common/utils/token.service.js";
import * as db_service from "../../DB/models/db.service.js";
import userModel from "../../DB/models/users.model.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enum/user.enum.js";
import {
  Audience,
  SaltRounds,
  Access_Secret_key,
  Refresh_Secret_key,
  Prefix,
} from "../../../config/config.service.js";
import cloudinary from "../../common/utils/cloudinary.js";

//======================================Sign UP======================================================

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone, provider } =
    req.body;

  console.log(req.file);

  if (password !== cPassword) {
    throw new Error("password doesn't match", { cause: 400 });
  }

  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("email already exists");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "uploads",
    },
  );

  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      cPassword,
      password: hash({
        plainText: password,
        saltRounds: SaltRounds,
      }),
      age,
      gender,
      phone: encrypt(phone),
      provider,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      profilePicture: { secure_url, public_id },
      //coverpics: arr_paths,
    },
  });

  await sendEmail(email, otp);

  successResp({
    res,
    status: 201,
    message: "success SignUp, OTP sent to your email",
    data: user,
  });
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
    secret_key: Access_Secret_key,
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
    secret_key: Access_Secret_key,
    options: {
      expiresIn: "1d",
      noTimestamp: true,
      jwtid: uuidv4(),
    },
  });
  const refresh_token = generateToken({
    payload: { id: user._id, email: user.email },
    secret_key: Refresh_Secret_key,
    options: {
      expiresIn: "1y",
      noTimestamp: true,
      jwtid: uuidv4(),
    },
  });

  successResp({ res, data: { access_token, refresh_token } });
};

//==============================Refresh token====================================================

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== Prefix) {
    throw new Error("invalid prefix");
  }

  const decoded = verifyToken({
    token,
    secret_key: Refresh_Secret_key,
  });

  if (!decoded || !decoded?.id) {
    throw new Error("inValid token");
  }

  const user = await db_service.findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 400 });
  }

  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    secret_key: Access_Secret_key,
    options: {
      expiresIn: "1d",
      noTimestamp: true,
      jwtid: uuidv4(),
    },
  });

  successResp({ res, message: "success", data: { access_token } });
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

//========================================share profile=============================
export const shareProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await db_service.findById({
    model: userModel,
    id: id,
    options: {
      select: "-password",
    },
  });

  if (!user) {
    throw new Error("user not exist");
  }

  user.phone = decrypt(user.phone);

  successResp({ res, data: user });
};
