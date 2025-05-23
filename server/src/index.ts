import express from "express";
import "dotenv/config";
import 'express-async-errors';

import authRouter from "./routes/auth";
import audioRouter from "./routes/audio";
import favoriteRouter from "./routes/favorite";
import playlistRouter from "./routes/playlist";
import profileRouter from "./routes/profile";
import historyRouter from './routes/history';

import "./database";
import './utils/schedule';
import { errorHandler } from "./middlewares/error";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/auth", authRouter);
app.use("/audios", audioRouter);
app.use("/favorites", favoriteRouter);
app.use("/playlist", playlistRouter);
app.use("/profile", profileRouter);
app.use('/history', historyRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 8383;

app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});
