import { verifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/models/db.service.js";
import userModel from "../../DB/models/users.model.js";
import { Prefix } from "../../../config/config.service.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import { get } from "../../DB/redis/redis.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== Prefix) {
    throw new Error("invalid prefix");
  }

  const decode = verifyToken({ token, secret_key: "kkkey" });

  if (!decode || !decode?.id) {
    throw new Error("invalid token payload");
  }

  const user = await db_service.findOne({
    model: userModel,
    filter: { _id: decode.id },
    // options: {
    //   select: "-password",
    // },
  });

  if (!user) {
    throw new Error("user not exists");
  }

  if (user?.changeCred?.getTime() > decode.iat * 1000) {
    throw new Error("inValid Token");
  }

  const revokeToken = await get(`revoketokeen::${user._id}::${decode.jti}`);
  if (revokeToken) {
    throw new Error("invalid token Revoked");
  }

  req.user = user;
  req.decode = decode;

  next();
};
