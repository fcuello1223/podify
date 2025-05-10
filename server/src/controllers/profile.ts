import { RequestHandler } from "express";
import { isValidObjectId, ObjectId } from "mongoose";

import User from "#/models/user";
import { paginationQuery } from "#/types/miscellaneous";
import Audio, { AudioDocument } from "#/models/audio";
import Playlist from "#/models/playlist";

export const updateFollower: RequestHandler = async (req, res) => {
  const { profileId } = req.params;

  let status: "added" | "removed";

  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Invalid Profile ID" });
  }

  const targetProfile = await User.findById(profileId);

  if (!targetProfile) {
    return res.status(404).json({ error: "Profile Not Found!" });
  }

  const alreadyAFollower = await User.findOne({
    _id: profileId,
    followers: req.user.id,
  });

  if (alreadyAFollower) {
    await User.updateOne(
      { _id: profileId },
      { $pull: { followers: req.user.id } }
    );

    status = "removed";
  } else {
    await User.updateOne(
      { _id: profileId },
      { $addToSet: { followers: req.user.id } }
    );

    status = "added";
  }

  if (status === "added") {
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { followings: profileId } }
    );
  }

  if (status === "removed") {
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { followings: profileId } }
    );
  }

  res.json({ status: status });
};

export const getAudioUploads: RequestHandler = async (req, res) => {
  const { pageNum = "0", limit = "10" } = req.query as paginationQuery;

  const targetAudios = await Audio.find({ owner: req.user.id })
    .skip(parseInt(limit) * parseInt(pageNum))
    .limit(parseInt(limit))
    .sort("-createdAt");

  const formattedAudios = targetAudios.map((audio) => {
    return {
      id: audio._id,
      title: audio.title,
      about: audio.about,
      file: audio.file.url,
      poster: audio.poster?.url,
      date: audio.createdAt,
      owner: { name: req.user.name, id: req.user.id },
    };
  });

  res.json({ audios: formattedAudios });
};

export const getPublicAudioUploads: RequestHandler = async (req, res) => {
  const { pageNum = "0", limit = "10" } = req.query as paginationQuery;

  const { profileId } = req.params;

  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Invalid Profile ID!" });
  }

  const targetAudios = await Audio.find({ owner: profileId })
    .skip(parseInt(limit) * parseInt(pageNum))
    .limit(parseInt(limit))
    .sort("-createdAt")
    .populate<AudioDocument<{ name: string; _id: ObjectId }>>("owner");

  const formattedAudios = targetAudios.map((audio) => {
    return {
      id: audio._id,
      title: audio.title,
      about: audio.about,
      file: audio.file.url,
      poster: audio.poster?.url,
      date: audio.createdAt,
      owner: { name: audio.owner.name, id: audio.owner._id },
    };
  });

  res.json({ audios: formattedAudios });
};

export const getPublicProfile: RequestHandler = async (req, res) => {
  const { profileId } = req.params;

  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Invalid Profile ID!" });
  }

  const targetUser = await User.findById(profileId);

  if (!targetUser) {
    return res.status(422).json({ error: "User Not Found!" });
  }

  res.json({
    profile: {
      id: targetUser._id,
      name: targetUser.name,
      followers: targetUser.followers.length,
      avatar: targetUser.avatar?.url,
    },
  });
};

export const getPublicPlaylist: RequestHandler = async (req, res) => {
  const { profileId } = req.params;

  const { pageNum = "0", limit = "10" } = req.query as paginationQuery;

  if (!isValidObjectId(profileId)) {
    return res.status(422).json({ error: "Invalid Profile ID!" });
  }

  const targetPlaylist = await Playlist.find({
    owner: profileId,
    visibility: "public",
  })
    .skip(parseInt(limit) * parseInt(pageNum))
    .limit(parseInt(limit))
    .sort("-createdAt");

  if (!targetPlaylist) {
    return res.json({ playlist: [] });
  }

  const formattedPlaylist = targetPlaylist.map((p) => {
    return {
      id: p._id,
      title: p.title,
      songCount: p.items.length,
      visibility: p.visibility,
    };
  });

  res.json({ playlist: formattedPlaylist });
};
