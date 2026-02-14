import { providerEnum } from "../../common/enum/user.enum.js";
import { successResp } from "../../common/utils/resp.success.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import { hash, compare } from "../../common/utils/security/hash.security.js";
import { generateToken } from "../../common/utils/token.service.js";
import * as db_service from "../../DB/models/db.service.js";
import userModel from "../../DB/models/users.model.js";
import { v4 as uuidv4 } from "uuid";

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

  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      password: hash({ plainText: password, saltRounds: 12 }),
      age,
      gender,
      phone: encrypt(phone),
      provider,
    },
  });

  successResp({ res, status: 201, message: "success SignUp", data: user });
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
    secret_key: "kkkey",
    options: {
      expiresIn: "1d",
      noTimestamp: true,
      // issuer: "http://localhost:3000",
      // audience: "http://localhost:4000",
      jwtid: uuidv4(),
    },
  });

  successResp({ res, data: { access_token } });
};

//======================================Get User======================================================

export const getProfile = async (req, res, next) => {
  //const { id } = req.params;
  // const { auth } = req.headers;

  // const decode = verifyToken({
  //   token: auth,
  //   secret_key: "kkkey",
  // });

  successResp({
    res,
    status: 200,
    message: "done",
    data: { ...req.user._doc, phone: decrypt(req.user.phone) },
  });
};
