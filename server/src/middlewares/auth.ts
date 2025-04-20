import { RequestHandler } from "express";

import PasswordResetToken from "#/models/passwordResetToken";

export const isValidPasswordResetToken: RequestHandler = async (req, res, next) => {
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
