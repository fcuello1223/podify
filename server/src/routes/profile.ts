import { Router } from "express";

import {
  getAudioUploads,
  getPublicAudioUploads,
  getPublicPlaylist,
  getPublicProfile,
  updateFollower,
} from "#/controllers/profile";
import { userMustBeAuth } from "#/middlewares/auth";

const router = Router();

router.post("/update-follower/:profileId", userMustBeAuth, updateFollower);
router.get("/audio-uploads", userMustBeAuth, getAudioUploads);
router.get("/audio-uploads/:profileId", getPublicAudioUploads);
router.get("/info/:profileId", getPublicProfile);
router.get("/playlist/:profileId", getPublicPlaylist);

export default router;
