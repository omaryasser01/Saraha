import { Router } from "express";
import * as MS from "./message.service.js";
import { multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
import { authentication } from "../../common/middleware/authentication.js";

const messageRouter = Router({
  caseSensitive: true,
  strict: true,
  mergeParams: true,
});

messageRouter.post(
  "/send",
  multer_local({
    custom_path: "messages",
    custom_types: multer_enum.image,
  }).array("attachments", 3),
  MS.sendMsg,
);

messageRouter.get("/:msgID", authentication, MS.getMsg);

messageRouter.get("/", authentication, MS.getMsgs);

export default messageRouter;
