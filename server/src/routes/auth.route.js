import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Auth Route with GET Method");
});

export default router;
