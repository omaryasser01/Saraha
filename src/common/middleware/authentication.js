import { verifyToken } from "../utils/token.service.js";
import * as db_service from "../../DB/models/db.service.js";
import userModel from "../../DB/models/users.model.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== "bearer") {
    throw new Error("invalid prefix");
  }

  const decode = verifyToken({ token, secret_key: "kkkey" });

  if (!decode || !decode?.id) {
    throw new Error("invalid token");
  }

  const user = await db_service.findOne({
    model: userModel,
    filter: { _id: decode.id },
    options: {
      select: "-password",
    },
  });

  if (!user) {
    throw new Error("user not exists");
  }

  req.user = user;

  next();
};
