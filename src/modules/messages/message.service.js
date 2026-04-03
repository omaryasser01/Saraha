import { successResp } from "../../common/utils/resp.success.js";
import * as db_service from "../../DB/models/db.service.js";
import msgModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/users.model.js";

//==============================send message===================================
export const sendMsg = async (req, res, next) => {
  const { content, userID } = req.body;

  const user = await db_service.findById({
    model: userModel,
    id: userID,
  });

  if (!user) {
    throw new Error("user not found");
  }

  let arr = [];

  if (req.files.length) {
    for (const file of req.files) {
      arr.push(file.path);
    }
  }

  const message = await db_service.create({
    model: msgModel,
    data: {
      content,
      userID: user._id,
      attachments: arr,
    },
  });

  successResp({
    res,
    status: 201,
    message: "your message has been sent successfully",
    data: message,
  });
};

//==============================get message===================================
export const getMsg = async (req, res, next) => {
  const { msgID } = req.params;

  const message = await db_service.findOne({
    model: msgModel,
    filter: {
      _id: msgID,
      userID: req.user._id,
    },
  });

  if (!message) {
    throw new Error("message not found");
  }

  successResp({
    res,
    status: 200,
    message: "sucessfully get your message",
    data: message,
  });
};

//==============================get messages===================================
export const getMsgs = async (req, res, next) => {
  const message = await db_service.find({
    model: msgModel,
    filter: {
      userID: req.params.userID,
    },
  });

  if (!message) {
    throw new Error("messages not found");
  }

  successResp({
    res,
    status: 200,
    message: "sucessfully get your messages",
    data: message,
  });
};
