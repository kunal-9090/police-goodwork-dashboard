const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, message) {
  try {
    await transporter.sendMail({
      from: `"Police Good Work Dashboard" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: message,
    });

    console.log("📧 Email Sent to:", to);
  } catch (err) {
    console.error("Email Error:", err.message);
  }
}

module.exports = sendEmail;
