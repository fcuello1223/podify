import express from "express";
import "dotenv/config";

import authRouter from "./routes/auth";
import audioRouter from "./routes/audio";
import favoriteRouter from "./routes/favorite";
import playlistRouter from "./routes/playlist";

import "./database";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("src/public"));

app.use("/auth", authRouter);
app.use("/audio", audioRouter);
app.use("/favorites", favoriteRouter);
app.use("/playlist", playlistRouter);

const PORT = process.env.PORT || 8383;

app.listen(PORT, () => {
  console.log(`Listening On Port ${PORT}`);
});
