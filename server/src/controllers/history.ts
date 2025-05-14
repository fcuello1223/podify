import { RequestHandler } from "express";

import History, { HistoryType } from "#/models/history";
import { paginationQuery } from "#/types/miscellaneous";

// export const updateHistory: RequestHandler = async (req, res) => {
//   const oldHistory = await History.findOne({ owner: req.user.id });

//   const { audio, progress, date } = req.body;

//   const history: HistoryType = { audio, progress, date };

//   if (!oldHistory) {
//     await History.create({ owner: req.user.id, last: history, all: [history] });

//     return res.json({ success: true });
//   }

//   const today = new Date();

//   const dayStart = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate()
//   );

//   const dayEnd = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate() + 1
//   );

//   const histories = await History.aggregate([
//     { $match: { owner: req.user.id } },
//     { $unwind: "$all" },
//     {
//       $match: {
//         "all.date": {
//           $gte: dayStart,
//           $lt: dayEnd,
//         },
//       },
//     },
//     {
//       $project: {
//         _id: 0,
//         audio: "$all.audio",
//       },
//     },
//   ]);

//   const sameDayHistory = histories.find((item) => {
//     if (item.audio.toString() === audio) {
//       return item;
//     }
//   });

//   if (sameDayHistory) {
//     await History.findOneAndUpdate(
//       {
//         owner: req.user.id,
//         "all.audio": audio
//       },
//       {
//         $set: {
//           "all.$.progress": progress,
//           "all.$.date": date,
//         },
//       }
//     );
//   } else {
//     await History.findByIdAndUpdate(oldHistory._id, {
//       $push: { all: { $each: [history], $position: 0 } },
//       $set: { last: history },
//     });
//   }

//   res.json(sameDayHistory);
// };

export const updateHistory: RequestHandler = async (req, res) => {
  const oldHistory = await History.findOne({ owner: req.user.id });

  const { audio, progress, date } = req.body;

  const history: HistoryType = { audio, progress, date };

  if (!oldHistory) {
    await History.create({
      owner: req.user.id,
      last: history,
      all: [history],
    });
    return res.json({ success: true });
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $project: {
        _id: 0,
        audio: "$all.audio",
      },
    },
  ]);

  const sameDayHistory = histories.find((item) => {
    if (item.audio.toString() === audio) return item;
  });

  if (sameDayHistory) {
    await History.findOneAndUpdate(
      {
        owner: req.user.id,
        "all.audio": audio,
      },
      {
        $set: {
          "all.$.progress": progress,
          "all.$.date": date,
        },
      }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory._id, {
      $push: { all: { $each: [history], $position: 0 } },
      $set: { last: history },
    });
  }

  res.json({ success: true });
};

export const removeHistory: RequestHandler = async (req, res) => {
  const removeAll = req.query.all === "yes";

  if (removeAll) {
    await History.findOneAndDelete({ owner: req.user.id });

    return res.json({ success: true });
  }

  const histories = req.query.histories as string;

  const historyIds = JSON.parse(histories) as string[];

  await History.findOneAndUpdate(
    { owner: req.user.id },
    { $pull: { all: { _id: historyIds } } }
  );

  res.json({ success: true });
};

export const getHistories: RequestHandler = async (req, res) => {
  const { pageNum = "0", limit = "10" } = req.query as paginationQuery;

  const histories = await History.aggregate([
    { $match: { owner: req.user.id } },
    {
      $project: {
        all: {
          $slice: [
            "$all",
            parseInt(limit) * parseInt(pageNum),
            parseInt(limit),
          ],
        },
      },
    },
    { $unwind: "$all" },
    {
      $lookup: {
        from: "audios",
        localField: "all.audio",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    { $unwind: "$audioInfo" },
    {
      $project: {
        _id: 0,
        id: "$all._id",
        audioId: "$audioInfo._id",
        date: "$all.date",
        title: "$audioInfo.title",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%m-%d-%Y", date: "$date" },
        },
        audios: {
          $push: "$$ROOT",
        },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        date: "$_id",
        audios: "$$ROOT.audios",
      },
    },
    { $sort: { date: -1 } },
  ]);

  res.json({ histories: histories });
};

export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const match = { $match: { owner: req.user.id } };

  const unwindAll = {
    $unwind: "$all",
  };

  const sortByDate = {
    $sort: {
      "all.date": -1,
    },
  } as any;

  const groupTop10 = {
    $group: {
      _id: "$_id",
      all: { $push: "$all" },
      owner: { $first: "$owner" },
    },
  };

  const sliceTop10 = {
    $project: {
      myHistory: { $slice: ["$all", 10] },
    },
  };

  const unwindWithIndex = {
    $unwind: { path: "$myHistory", includeArrayIndex: "index" },
  };

  const audioLookup = {
    $lookup: {
      from: "audios",
      localField: "myHistory.audio",
      foreignField: "_id",
      as: "audioInfo",
    },
  };

  const unwindAudioInfo = {
    $unwind: "$audioInfo",
  };

  const userLookup = {
    $lookup: {
      from: "users",
      localField: "audioInfo.owner",
      foreignField: "_id",
      as: "owner",
    },
  };

  const unwindOwner = { $unwind: "$owner" };

  const projectResult = {
    $project: {
      _id: 0,
      id: "$audioInfo._id",
      title: "$audioInfo.title",
      about: "$audioInfo.about",
      file: "$audioInfo.file.url",
      poster: "$audioInfo.poster.url",
      category: "$audioInfo.category.url",
      owner: { name: "$owner.name", id: "$owner._id" },
      date: "$histories.date",
      progress: "$histories.progress",
    },
  };

  const recentlyPlayedAudios = await History.aggregate([
    match,
    unwindAll,
    sortByDate,
    groupTop10,
    sliceTop10,
    unwindWithIndex,
    audioLookup,
    unwindAudioInfo,
    userLookup,
    unwindOwner,
    projectResult,
  ]);

  res.json({ recentlyPlayedAudios: recentlyPlayedAudios });
};
