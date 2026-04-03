import mongoose from "mongoose";
import { DB_URi_online } from "../../config/config.service.js";

const checkDB = async () => {
  await mongoose
    .connect(DB_URi_online, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("connected to DB successfully");
    })
    .catch((error) => {
      console.log("faild to connect to DB", error);
    });
};

export default checkDB;
