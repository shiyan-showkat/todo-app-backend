import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  try {
    console.log("EMAIL:", process.env.USER_EMAIL);
    console.log("PASS EXISTS:", !!process.env.USER_PASS);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
      tls: {
        rejectUnauthorized: false, // 🔥 IMPORTANT FIX
      },
    });

    const info = await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    console.log("EMAIL SENT SUCCESS:", info.response);
  } catch (error) {
    console.log("EMAIL FAILED:", error);
  }
};
