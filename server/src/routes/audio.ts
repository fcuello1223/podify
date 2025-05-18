import { createAudio, getLatestUploads, updateAudio } from "#/controllers/audio";
import { isVerified, userMustBeAuth } from "#/middlewares/auth";
import { fileParser } from "#/middlewares/fileParser";
import { validate } from "#/middlewares/validator";
import { AudioValidationSchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post(
  "/create",
  userMustBeAuth,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  createAudio
);

router.patch(
  "/:audioId",
  userMustBeAuth,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  updateAudio
);

router.get('/latest', getLatestUploads);

export default router;
