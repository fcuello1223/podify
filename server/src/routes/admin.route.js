import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Admin Route with GET Method");
});

export default router;
