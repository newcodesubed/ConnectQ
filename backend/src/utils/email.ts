import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL } from "./emailTemplates";
import { sender, transporter } from "./email.config";
import { SentMessageInfo } from "nodemailer";

export const sendVerificationEmail = async (email: string, verificationToken: string): Promise<SentMessageInfo> => {
  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Verify your signup",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    });

    console.log("Verification email sent: %s", response.messageId);
    return response;
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    throw new Error(`Failed to send verification email: ${error.message || error}`);
  }
};

export const sendWelcomeEmail = async (email: string, name: string, appUrl: string): Promise<SentMessageInfo> => {
  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Welcome Email",
      html: WELCOME_EMAIL.replace("{username}", name).replace("{appUrl}", appUrl),
    });

    console.log("Welcome email sent successfully:", response.messageId);
    return response;
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error.message || error}`);
  }
};

export const sendPasswordResetEmail = async (email: string, resetURL: string): Promise<SentMessageInfo> => {
  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Password Reset",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    console.log("Password reset email sent successfully:", response.messageId);
    return response;
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Failed to send password reset email: ${error.message || error}`);
  }
};

export const sendResetSuccessEmail = async (email: string): Promise<SentMessageInfo> => {
  try {
    const response = await transporter.sendMail({
      from: sender,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent:", response.messageId);
    return response;
  } catch (error: any) {
    console.error("Error sending reset success email:", error);
    throw new Error(`Failed to send reset success email: ${error.message || error}`);
  }
};
