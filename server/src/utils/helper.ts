import moment from "moment";

import History from "#/models/history";
import { UserDocument } from "#/models/user";

export const generateToken = (len = 8) => {
  let token = "";

  for (let i = 0; i < len; i++) {
    const digit = Math.floor(Math.random() * 10);
    token += digit;
  }

  return token;
};

export const formatProfile = (user: UserDocument) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    followers: user.followers.length,
    followings: user.followings.length,
  };
};

export const getUserPrevHistory = async (req: any): Promise<string[]> => {
  const [result] = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: moment().subtract(30, "days").toDate(),
        },
      },
    },
    {
      $group: { _id: "$all.audio" },
    },
    {
      $lookup: {
        from: "audios",
        localField: "_id",
        foreignField: "_id",
        as: "audioData",
      },
    },
    {
      $unwind: "$audioData",
    },
    { $group: { _id: null, category: { $addToSet: "$audioData.category" } } },
  ]);

  if (result) {
    return result.category;
  }

  return [];
};
