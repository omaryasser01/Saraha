import { successResp } from "../../common/utils/resp.success.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { hash, compare } from "../../common/utils/security/hash.security.js";
import { generateOTP, sendEmail } from "../../common/utils/sendEmail.js";
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
import { randomUUID } from "crypto";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import * as redis_services from "../../DB/redis/redis.service.js";
import { set } from "mongoose";

//======================================Sign UP======================================================

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone, provider } =
    req.body;

  if (password !== cPassword) {
    throw new Error("password doesn't match", { cause: 400 });
  }

  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("email already exists");
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "uploads",
    },
  );

  let otp = await generateOTP();

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

  await redis_services.setValue({
    key: redis_services.otp_key(email),
    value: hash({ plainText: `${otp}` }),
    ttl: 2 * 60,
  });

  await redis_services.setValue({
    key: redis_services.otp_count(email),
    value: 1,
    ttl: 2 * 60,
  });

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
    filter: {
      email,
      confirmed: { $exists: true },
      provider: providerEnum.System,
    },
  });

  if (!user) {
    throw new Error("user not exists");
  }

  const match = compare({ plainText: password, cipherText: user.password });

  if (!match) {
    throw new Error("invaild password");
  }

  const jwtid = randomUUID();

  const access_token = generateToken({
    payload: { id: user._id, email: user.email },
    secret_key: Access_Secret_key,
    options: {
      expiresIn: "1h",
      noTimestamp: false,
      jwtid,
    },
  });

  const refresh_token = generateToken({
    payload: { id: user._id, email: user.email },
    secret_key: Refresh_Secret_key,
    options: {
      expiresIn: "1h",
      noTimestamp: false,
      jwtid,
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

  const otpValue = await redis_services.get(redis_services.otp_key(email));
  if (!otpValue) {
    throw new Error("OTP expired");
  }
  if (!compare({ plainText: otp, cipherText: otpValue })) {
    throw new Error("inValid OTP");
  }

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.System,
      //confirmed: { $exists: false },
    },
    update: { confirmed: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await redis_services.deleteKey(redis_services.otp_key(email));

  successResp({
    res,
    status: 200,
    message: "Account verified successfully",
  });
};
// if (otp !== user.otp || user.otpExpires < Date.now()) {
//   throw new Error("inValid or expired otp");
// }

// user.otp = null;
// user.otpExpires = null;
// user.confirmed = true;

// await user.save();

//======================================resend OTP======================================================

export const resendOTP = async (req, res, next) => {
  const { email } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum.System,
      //confirmed: { $exists: false },
    },
  });

  if (!user) {
    throw new Error("User not found or already confirmed");
  }

  const block = await redis_services.ttl(redis_services.block_otp(email));
  if (block > 0) {
    throw new Error(
      `You have exceeded the maximum number of OTP requests. Please try again after ${block} seconds.`,
    );
  }

  const ttl = await redis_services.ttl(redis_services.otp_key(email));
  if (ttl > 0) {
    throw new Error(`Please wait ${ttl} seconds before requesting a new OTP`);
  }

  const otp_count = await redis_services.get(redis_services.otp_count(email));
  if (otp_count >= 3) {
    await redis_services.setValue({
      key: redis_services.block_otp(email),
      value: 1,
      ttl: 60 * 7,
    });
    throw new Error(
      "You have exceeded the maximum number of OTP requests. Please try again later.",
    );
  }

  let otp = await generateOTP();

  await sendEmail(user.email, otp);

  await redis_services.setValue({
    key: redis_services.otp_key(email),
    value: hash({ plainText: `${otp}` }),
    ttl: 2 * 60,
  });

  await redis_services.increment(redis_services.otp_count(email));

  successResp({
    res,
    status: 200,
    message: "New OTP sent to your email",
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

//========================================update user=============================
export const updateProfile = async (req, res, next) => {
  let { firstName, lastName, gender, phone } = req.body;

  if (phone) {
    phone = encrypt(phone);
  }

  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    update: { firstName, lastName, gender, phone },
  });

  if (!user) {
    throw new Error("user not exist");
  }

  successResp({ res, data: user });
};

//========================================update password=============================
export const updatePassword = async (req, res, next) => {
  let { oldPass, newPass } = req.body;

  console.log(oldPass);
  console.log(req.user.password);
  if (!compare({ plainText: oldPass, cipherText: req.user.password })) {
    throw new Error("inValid old password");
  }

  const hashed = hash({ plainText: newPass });

  req.user.password = hashed;

  await req.user.save();

  successResp({ res });
};

//========================================log out=============================
export const logOut = async (req, res, next) => {
  const { flag } = req.query;

  if (flag == "all") {
    req.user.changeCred = new Date();
    await req.user.save();
    await redis_services.deleteKey(await keys(`revoketokeen::${req.user._id}`));
  } else {
    await redis_services.setValue({
      key: `revoketokeen::${req.user._id}::${req.decode.jti}`,
      value: `${req.decode.jti}`,
      ttl: req.decode.exp - Math.floor(Date.now() / 1000),
    });
  }

  successResp({ res });
};
