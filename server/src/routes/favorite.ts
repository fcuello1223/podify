import { Router } from "express";

import { isVerified, userMustBeAuth } from "#/middlewares/auth";
import { getFavorites, getIsFavorite, toggleFavorite } from "#/controllers/favorite";

const router = Router();

router.post("/", userMustBeAuth, isVerified, toggleFavorite);
router.get("/", userMustBeAuth, getFavorites);
router.get("/is-favorite", userMustBeAuth, getIsFavorite);

export default router;
