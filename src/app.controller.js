import express from "express";
import userModel from "./DB/models/users.model.js";
import userRouter from "./modules/user/user.controller.js";
import checkDB from "./DB/connectionDB.js";
import cors from "cors";
import { Port, white_list } from "../config/config.service.js";
import { connectRedis } from "./DB/redis/redis.connection.js";
import messageRouter from "./modules/messages/message.controller.js";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
const app = express();
const port = Port;

const bootstrap = () => {
  const limiter = rateLimit(
    {
      windowMs: 60 * 3 * 1000,
      limit: 5,
    },
    { legacyHeaders: false },
  );

  const corsOptions = {
    origin: (origin, callback) => {
      if ([...white_list, undefined].includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  };

  app.use(
    cors(corsOptions),
    helmet(), //limiter,
    express.json(),
  );
  app.use("/uploads", express.static("uploads"));

  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "Welcome to Saraha APP ......  " });
  });

  checkDB();
  connectRedis();

  app.use("/users", userRouter);
  app.use("/messages", messageRouter);

  userModel;

  app.get("{/*demo}", (req, res, next) => {
    throw new Error(`connection to ${req.originalUrl} faild, not found `, {
      cause: 404,
    });
  });

  app.use((err, req, res, next) => {
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => {
    console.log(`server is running on ${port}`);
  });
};

export default bootstrap;
