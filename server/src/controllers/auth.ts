import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { CreateUser, VerifyEmailRequest } from "#/types/user";
import User from "#/models/user";
import { formatProfile, generateToken } from "#/utils/helper";
import {
  sendForgotPasswordLink,
  sendPasswordResetSuccessEmail,
  sendVerificationMail,
} from "#/utils/mail";
import EmailVerificationToken from "#/models/emailVerificationToken";
import PasswordResetToken from "#/models/passwordResetToken";
import { JWT_SECRET, PASSWORD_RESET_LINK } from "#/utils/variables";
import { RequestWithFiles } from "#/middlewares/fileParser";
import formidable from "formidable";
import cloudinary from "#/cloud";

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

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const targetUser = await User.findOne({ email: email });

  if (!targetUser) {
    return res.status(403).json({ error: "E-Mail/Password Mismatch!" });
  }

  const passwordMatch = await targetUser.comparePassword(password);

  if (!passwordMatch) {
    return res.status(403).json({ error: "E-Mail/Password Mismatch!" });
  }

  const token = jwt.sign({ userId: targetUser._id }, JWT_SECRET);

  targetUser.tokens.push(token);

  await targetUser.save();

  res.json({
    profile: {
      id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      verified: targetUser.verified,
      avatar: targetUser.avatar?.url,
      followers: targetUser.followers.length,
      followings: targetUser.followings.length,
    },
    token: token,
  });
};

export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  try {
    const { name } = req.body;
    const avatar = req.files?.avatar as formidable.File;

    const targetUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    if (typeof name !== "string" || name.trim().length < 3) {
      return res.status(422).json({ error: "Invalid Name!" });
    }

    targetUser.name = name;

    if (avatar) {
      if (targetUser.avatar?.publicId) {
        await cloudinary.uploader.destroy(targetUser.avatar?.publicId);
      }
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        avatar.filepath,
        {
          width: 300,
          height: 300,
          crop: "thumb",
          gravity: "face",
        }
      );

      targetUser.avatar = { url: secure_url, publicId: public_id };
    }

    await targetUser.save();

    res.json({ profile: formatProfile(targetUser) });
  } catch (err) {
    console.error("Update profile failed:", err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

export const sendProfile: RequestHandler = (req, res) => {
  res.json({ profile: req.user });
};

export const logout: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;

  const userToken = req.token;

  const targetUser = await User.findById(req.user.id);

  if (!targetUser) {
    throw new Error("Something Went Wrong! User Not Found!");
  }

  if (fromAll === "yes") {
    targetUser.tokens = [];
  } else {
    targetUser.tokens = targetUser.tokens.filter((token) => token !== userToken);
  }

  await targetUser.save();

  res.json({ success: true });
};
