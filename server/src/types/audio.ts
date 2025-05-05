import { ObjectId } from "mongoose";

import { AudioDocument } from "#/models/audio";

export type PopulatedFavoriteList = AudioDocument<{
  _id: ObjectId;
  name: string;
}>;
