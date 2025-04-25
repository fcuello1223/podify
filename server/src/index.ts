import express from "express";
import "dotenv/config";

import authRouter from "./routes/auth";
import "./database";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/auth", authRouter);

const PORT = process.env.PORT || 8383;

app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});
