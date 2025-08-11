import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";

//Helper Function for Cloudinary Uploads
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });

    return result.secure_url;
  } catch (error) {
    console.log("Error Uploading to Cloudinary", error);

    throw new Error("Error Uploading to Cloudinary");
  }
};

export const createSong = async (req, res, next) => {
  try {
    if (!req.files || !req.files.audioFile || !req.files.imageFile) {
      return res.status(400).json({ message: "Please Upload All Files!" });
    }

    const { title, artist, albumId, duration } = req.body;

    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    const song = new Song({
      title,
      artist,
      audioUrl,
      imageUrl,
      duration,
      albumId: albumId || null,
    });

    await song.save();

    if (albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id },
      });
    }

    res.status(201).json(song);
  } catch (error) {
    console.log("Error Creating Song!", error);

    next(error);
  }
};

export const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);

    //If Song Belongs to an Album, Update the Album's Songs Array
    if (song.albumId) {
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id },
      });
    }

    await Song.findByIdAndDelete(id);

    res.status(200).json({ message: "Song Deleted Successfully!" });
  } catch (error) {
    console.log("Error Deleting Song!");

    next(error);
  }
};

export const createAlbum = async (req, res, next) => {
  try {
    const { title, artist, releaseYear } = req.body;
    const { imageFile } = req.files;

    const imageUrl = await uploadToCloudinary(imageFile);

    const album = new Album({
      title,
      artist,
      releaseYear,
      imageUrl,
    });

    await album.save();

    res.status(201).json(album);
  } catch (error) {
    console.log("Error Creating Album!", error);
  }
};

export const deleteAlbum = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Song.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);

    res.status(200).json({ message: "Album Deleted Successfully!" });
  } catch (error) {}
};

export const checkAdmin = async (req, res, next) => {
  res.status(200).json({ admin: true });
};
