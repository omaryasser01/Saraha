import mongoose from "mongoose";

const checkDB = async () => {
  await mongoose
    .connect("mongodb://localhost:27017/Saraha", {
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
