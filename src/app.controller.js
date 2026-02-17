import express from "express";
import userModel from "./DB/models/users.model.js";
import userRouter from "./modules/user/user.controller.js";
import checkDB from "./DB/connectionDB.js";
import cors from "cors";
const app = express();
const port = 3000;

const bootstrap = () => {
  app.use(cors(), express.json());

  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "Welcome to Saraha APP ......  " });
  });

  checkDB();
  app.use("/users", userRouter);

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
