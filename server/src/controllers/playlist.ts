import { RequestHandler } from "express";

import Audio from "#/models/audio";
import Playlist from "#/models/playlist";
import { CreatePlaylistRequest, PopulatedFavoriteList, UpdatePlaylistRequest } from "#/types/audio";
import { isValidObjectId } from "mongoose";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, resId, visibility } = req.body;

  const ownerId = req.user.id;

  if (resId) {
    const targetAudio = await Audio.findById(resId);

    if (!targetAudio) {
      return res.status(404).json({ error: "Could Not Find Audio" });
    }
  }

  const newPlaylist = new Playlist({
    title: title,
    owner: ownerId,
    visibility: visibility,
  });

  if (resId) {
    newPlaylist.items = [resId as any];
  }

  await newPlaylist.save();

  res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility,
    },
  });
};

export const updatePlaylist: RequestHandler = async (
  req: UpdatePlaylistRequest,
  res
) => {
  const { id, item, title, visibility } = req.body;

  const targetPlaylist = await Playlist.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { title: title, visibility: visibility },
    { new: true }
  );

  if (!targetPlaylist) {
    return res.status(404).json({ error: "Playlist Not Found!" });
  }

  if (item) {
    const targetAudio = await Audio.findById(item);

    if (!targetAudio) {
      return res.status(404).json({ error: "Audio Not Found!" });
    }

    // targetPlaylist.items.push(targetAudio._id);

    // await targetPlaylist.save();

    await Playlist.findByIdAndUpdate(targetPlaylist._id, {
      $addToSet: { items: item },
    });
  }

  res.json({
    updatedPlaylist: {
      id: targetPlaylist._id,
      title: targetPlaylist.title,
      visibility: targetPlaylist.visibility,
    },
  });
};

export const removePlaylist: RequestHandler = async (req, res) => {
  const { playlistId, audioId, all } = req.query;

  if (!isValidObjectId(playlistId)) {
    return res.status(422).json({ error: "Invalid Playlist ID!" });
  }

  if (all === "yes") {
    const targetPlaylist = await Playlist.findOneAndDelete({
      _id: playlistId,
      owner: req.user.id,
    });

    if (!targetPlaylist) {
      return res.status(404).json({ error: "Playlist Not Found!" });
    }
  }

  if (audioId) {
    if (!isValidObjectId(audioId)) {
      return res.status(422).json({ error: "Invalid Audio ID!" });
    }

    const targetPlaylist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user.id,
      },
      { $pull: { items: audioId } }
    );

    if (!targetPlaylist) {
      return res.status(404).json({ error: "Playlist Not Found!" });
    }
  }

  res.json({ success: true });
};

export const getPlaylistByProfile: RequestHandler = async (req, res) => {
  const { pageNum = "0", limit = "10" } = req.query as {
    pageNum: string;
    limit: string;
  };

  const targetPlaylist = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: "auto" },
  })
    .skip(parseInt(pageNum) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const userPlaylist = targetPlaylist.map((item) => {
    return {
      id: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility,
    };
  });

  res.json({ userPlaylist: userPlaylist });
};

export const getAudios: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(422).json({ error: "Invalid Playlist ID!" });
  }

  const targetPlaylist = await Playlist.findOne({
    owner: req.user.id,
    _id: playlistId,
  }).populate<{items: PopulatedFavoriteList[]}>({
    path: "items",
    populate: { path: "owner", select: "name" },
  });

  if (!targetPlaylist) {
    return res.json({ playlist: [] });
  }

  const targetAudios = targetPlaylist.items.map((item) => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      poster: item.poster?.url,
      owner: { name: item.owner.name, id: item.owner._id },
    };
  });

  res.json({
    playlist: {
      id: targetPlaylist._id,
      title: targetPlaylist.title,
      audios: targetAudios,
    },
  });
};
