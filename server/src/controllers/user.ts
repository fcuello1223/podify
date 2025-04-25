import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import crypto from "crypto";

import { CreateUser, VerifyEmailRequest } from "#/types/user";
import User from "#/models/user";
import { generateToken } from "#/utils/helper";
import {
  sendForgotPasswordLink,
  sendPasswordResetSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import EmailVerificationToken from "#/models/emailVerificationToken";
import PasswordResetToken from "#/models/passwordResetToken";
import { PASSWORD_RESET_LINK } from "#/utils/variables";

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({ name, email, password });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: newUser._id,
    token,
  });

  sendVerificationMail(token, {
    name: name,
    email: email,
    userId: newUser._id.toString(),
  });

  res.status(201).json({ newUser: { id: newUser._id, name, email } });
};

export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { token, userId } = req.body;

  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (!verificationToken) {
    return res.status(403).json({ error: "Invalid Token!" });
  }

  const isMatch = await verificationToken.compareToken(token);

  if (!isMatch) {
    return res.status(403).json({ error: "Invalid Token!" });
  }

  await User.findByIdAndUpdate(userId, { verified: true });

  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: "Your E-Mail Has Been Verified!" });
};

export const sendReVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ error: "Invalid request!" });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: "Invalid request!" });

  await EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user.name,
    email: user.email,
    userId: user._id.toString(),
  });

  res.json({ message: "Please check Your E-Mail" });
};

export const generateForgotPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ error: "Account Not Found!" });
  }

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  //Generate Link
  const token = crypto.randomBytes(36).toString("hex");

  await PasswordResetToken.create({ owner: user._id, token: token });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgotPasswordLink({
    name: user.name,
    email: user.email,
    link: resetLink,
  });

  res.json({ message: "Please Check Your Registed E-Mail!" });
};




export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(403).json({ error: "Unauthorized Access!" });
  }

  const isMatch = await targetUser.comparePassword(password);

  if (isMatch) {
    return res
      .status(422)
      .json({ error: "THe New Password Must Be Different!" });
  }

  targetUser.password = password;

  await targetUser.save();

  await PasswordResetToken.findOneAndDelete({ owner: targetUser._id });

  sendPasswordResetSuccessEmail(targetUser.name, targetUser.email);

  res.json({ message: "Password Reset Successfully!" });
};
