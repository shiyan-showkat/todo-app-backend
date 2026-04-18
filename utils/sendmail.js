import nodemailer from "nodemailer";

export const sendEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Shiyan App 🚀" <${process.env.USER_EMAIL}>`,
      to,
      subject: "OTP Verification",
      html: `
        <div style="font-family:sans-serif;">
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color:#facc15;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log("EMAIL SENT SUCCESS:", info.response);
  } catch (error) {
    console.log("EMAIL FAILED ❌:", error.message);
  }
};
