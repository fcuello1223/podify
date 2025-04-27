import { Router } from "express";

import {
  create,
  generateForgotPasswordLink,
  grantValid,
  sendReVerificationToken,
  signIn,
  updatePassword,
  verifyEmail,
} from "#/controllers/user";

import { isValidPasswordResetToken, userMustBeAuth } from "#/middlewares/auth";
import { validate } from "#/middlewares/validator";

import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndIDValidation,
  UpdatePasswordSchema,
} from "#/utils/validationSchema";

const router = Router();

router.post("/create", validate(CreateUserSchema), create);

router.post("/verify-email", validate(TokenAndIDValidation), verifyEmail);
router.post("/re-verify-email", sendReVerificationToken);

router.post("/forgot-password", generateForgotPasswordLink);
router.post(
  "/verify-password-reset-token",
  validate(TokenAndIDValidation),
  isValidPasswordResetToken,
  grantValid
);
router.post(
  "/update-password",
  validate(UpdatePasswordSchema),
  isValidPasswordResetToken,
  updatePassword
);

router.post("/sign-in", validate(SignInValidationSchema), signIn);

router.get("/is-auth", userMustBeAuth, (req, res) => {
  res.json({ profile: req.user });
});

router.get("/public", (req, res) => {
  res.json({ message: 'You Are In A Public Route' });
});

router.get("/private", userMustBeAuth, (req, res) => {
  res.json({ message: 'You Are In A Private Route' });
});

export default router;
