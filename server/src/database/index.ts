import mongoose from "mongoose";

import { MONGO_URI } from "#/utils/variables";

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Database Connection Failed: ", err);
  });
