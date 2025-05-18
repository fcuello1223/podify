import { Request } from "express";

import { AudioDocument } from "#/models/audio";


export type PopulatedFavoriteList = AudioDocument<{
  name: string;
  email: string;
}>;

export interface CreatePlaylistRequest extends Request {
  body: {
    title: string;
    resId: string;
    visibility: "public" | "private";
  }
}

export interface UpdatePlaylistRequest extends Request {
  body: {
    title: string;
    item: string;
    id: string;
    visibility: "public" | "private";
  };
}
