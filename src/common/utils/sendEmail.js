import nodemailer from "nodemailer";
import { Pass, User } from "../../../config/config.service.js";

export const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: User,
      pass: Pass,
    },
  });

  const info = await transporter.sendMail({
    from: User,
    to,
    subject: "Welcome to Saraha App - Your OTP Code",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });

  return console.log(info.accepted.length > 0 ? true : false);
};

export const generateOTP = async () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
