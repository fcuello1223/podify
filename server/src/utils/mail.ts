import nodemailer from "nodemailer";
import path from "path";

import User from "#/models/user";
import EmailVerificationToken from "#/models/emailVerificationToken";
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  SIGN_IN_URL,
  VERIFICATION_EMAIL,
} from "#/utils/variables";
import { generateTemplate } from "#/mail/template";

interface Profile {
  name: string;
  email: string;
  userId: string;
}

const generateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  return transport;
};

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name}, welcome to Podify! There are so much thing that we do for verified users. Use the given OTP to verify your email.`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Welcome Message",
    html: generateTemplate({
      title: "Welcome To Podify!",
      message: welcomeMessage,
      logo: "cid:logo",
      banner: "cid:welcome",
      link: "#",
      btnTitle: token,
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "welcome.png",
        path: path.join(__dirname, "../mail/welcome.png"),
        cid: "welcome",
      },
    ],
  });
};

interface Options {
  name: string;
  email: string;
  link: string;
}

export const sendForgotPasswordLink = async (options: Options) => {
  const transport = generateMailTransporter();

  const { name, email, link } = options;

  const forgotPasswordMessage = `Hi ${name}, we just received a request that you forgot your password. Please use the link below to reset your password`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Reset Password Link",
    html: generateTemplate({
      title: "Forgot Password",
      message: forgotPasswordMessage,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: link,
      btnTitle: "Reset Password",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};

export const sendPasswordResetSuccessEmail = async (name: string, email: string) => {
  const transport = generateMailTransporter();

  const updatePasswordMessage = `Hi ${name}, we just updated your password. You are now able to sign in with your new password!`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: "Update Password Successful",
    html: generateTemplate({
      title: "Update Password Successful",
      message: updatePasswordMessage,
      logo: "cid:logo",
      banner: "cid:forget_password",
      link: SIGN_IN_URL,
      btnTitle: "Log In",
    }),
    attachments: [
      {
        filename: "logo.png",
        path: path.join(__dirname, "../mail/logo.png"),
        cid: "logo",
      },
      {
        filename: "forget_password.png",
        path: path.join(__dirname, "../mail/forget_password.png"),
        cid: "forget_password",
      },
    ],
  });
};
