import { Router } from "express";

import { isVerified, userMustBeAuth } from "#/middlewares/auth";
import { validate } from "#/middlewares/validator";
import {
  NewPlaylistValidationSchema,
  OldPlaylistValidationSchema,
} from "#/utils/validationSchema";
import {
  createPlaylist,
  getAudios,
  getPlaylistByProfile,
  removePlaylist,
  updatePlaylist,
} from "#/controllers/playlist";

const router = Router();

router.post(
  "/create",
  userMustBeAuth,
  isVerified,
  validate(NewPlaylistValidationSchema),
  createPlaylist
);

router.patch(
  "/",
  userMustBeAuth,
  validate(OldPlaylistValidationSchema),
  updatePlaylist
);

router.delete("/", userMustBeAuth, removePlaylist);

router.get("/by-profile", userMustBeAuth, getPlaylistByProfile);

router.get('/:playlistId', userMustBeAuth, getAudios);

export default router;
