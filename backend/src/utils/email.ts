import { transporter } from "./email.config";

export const sendVerificationEmail = async (to: string, code: string) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email",
    text: `Your verification code is ${code}`,
  });
};