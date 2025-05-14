import { Router } from "express";

import { getHistories, getRecentlyPlayed, removeHistory, updateHistory } from "#/controllers/history";
import { userMustBeAuth } from "#/middlewares/auth";
import { validate } from "#/middlewares/validator";
import { UpdateHistoryValidationSchema } from "#/utils/validationSchema";

const router = Router();

router.post('/', userMustBeAuth, validate(UpdateHistoryValidationSchema), updateHistory);
router.delete('/', userMustBeAuth, removeHistory);
router.get('/', userMustBeAuth, getHistories);
router.get('/recently-played', userMustBeAuth, getRecentlyPlayed);

export default router;
