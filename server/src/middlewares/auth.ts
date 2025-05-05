import { RequestHandler } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

import User from "#/models/user";
import PasswordResetToken from "#/models/passwordResetToken";

import { JWT_SECRET } from "#/utils/variables";

export const isValidPasswordResetToken: RequestHandler = async (
  req,
  res,
  next
) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetToken.findOne({ owner: userId });

  if (!resetToken) {
    return res
      .status(403)
      .json({ error: "Unauthorized Access Due To Invalid Token!" });
  }

  const isMatch = await resetToken.compareToken(token);

  if (!isMatch) {
    return res
      .status(403)
      .json({ error: "Unauthorized Access Due To Invalid Token!" });
  }

  next();
};

export const userMustBeAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(403).json({ error: "Unauthorized Request!" });
  }

  const payload = verify(token, JWT_SECRET) as JwtPayload;

  const id = payload.userId;

  const verifiedUser = await User.findOne({ _id: id, tokens: token });

  if (!verifiedUser) {
    return res.status(403).json({ error: "Unauthorized Request!" });
  }

  req.user = {
    id: verifiedUser._id,
    name: verifiedUser.name,
    email: verifiedUser.email,
    verified: verifiedUser.verified,
    avatar: verifiedUser.avatar?.url,
    followers: verifiedUser.followers.length,
    followings: verifiedUser.followings.length,
  };

  req.token = token;

  next();
};

export const isVerified: RequestHandler = (req, res, next) => {
  if (!req.user.verified) {
    return res.status(403).json({ error: "Please Verify Your E-Mail!" });
  }

  next();
};
