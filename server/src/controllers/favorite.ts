import { RequestHandler } from "express";
import { isValidObjectId, ObjectId } from "mongoose";

import Audio, { AudioDocument } from "#/models/audio";
import Favorite from "#/models/favorite";
import { PopulatedFavoriteList } from "#/types/audio";
import { paginationQuery } from "#/types/miscellaneous";

export const toggleFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;

  let status: "added" | "removed";

  if (!isValidObjectId(audioId)) {
    return res.status(422).json({ error: "Invalid Audio ID!" });
  }

  const targetAudio = await Audio.findById(audioId);

  if (!targetAudio) {
    return res.status(404).json({ error: "Resources Not Found!" });
  }

  //Audio is already in favorites
  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  if (alreadyExists) {
    //Remove from old lists
    await Favorite.updateOne(
      { owner: req.user.id },
      { $pull: { items: audioId } }
    );

    status = "removed";
  } else {
    const targetFavorite = await Favorite.findOne({ owner: req.user.id });

    if (targetFavorite) {
      //Add New Audio To Old List
      await Favorite.updateOne(
        { owner: req.user.id },
        {
          $addToSet: { items: audioId },
        }
      );
    } else {
      //Create New Favorite List
      await Favorite.create({ owner: req.user.id, items: [audioId] });
    }

    status = "added";
  }

  if (status === "added") {
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: { likes: req.user.id },
    });
  }

  if (status === "removed") {
    await Audio.findByIdAndUpdate(audioId, {
      $pull: { likes: req.user.id },
    });
  }

  res.json({ status: status });
};

export const getFavorites: RequestHandler = async (req, res) => {
  const userId = req.user.id;

  const { pageNum = "0", limit = "10" } = req.query as paginationQuery;

  const favoriteAudios = await Favorite.aggregate([
    { $match: { owner: userId } },
    {
      $project: {
        audioIds: {
          $slice: [
            "$items",
            parseInt(pageNum) * parseInt(limit),
            parseInt(limit),
          ],
        },
      },
    },
    { $unwind: "$audioIds" },
    {
      $lookup: {
        from: "audios",
        localField: "audioIds",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    { $unwind: "$audioInfo" },
    {
      $lookup: {
        from: "users",
        localField: "audioInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: "$ownerInfo" },
    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        file: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        owner: {name: "$ownerInfo.name", id: "$ownerInfo._id"}
      },
    },
  ]);

  res.json({ favoriteAudios: favoriteAudios });
};

export const getIsFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId;

  if (!isValidObjectId(audioId)) {
    return res.status(422).json({ error: "Invalid Audio ID" });
  }

  const targetFavorite = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  res.json({ result: targetFavorite ? true : false });
};
