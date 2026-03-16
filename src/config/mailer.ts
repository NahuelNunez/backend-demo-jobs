import nodemailer from "nodemailer";
import { config } from "./env";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

export async function sendMail(options: nodemailer.SendMailOptions) {
  await transporter.sendMail({
    from: config.SMTP_USER,
    ...options,
  });
}
