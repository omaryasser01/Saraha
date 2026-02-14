import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "totp12507@gmail.com",
      pass: "xfgw risx zvzf lrex",
    },
  });

  await transporter.sendMail({
    from: "totp12507@gmail.com",
    to,
    subject: "Verify your account",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });
};
