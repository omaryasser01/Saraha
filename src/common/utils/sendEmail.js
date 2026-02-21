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

  await transporter.sendMail({
    from: User,
    to,
    subject: "Verify your account",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });
};
