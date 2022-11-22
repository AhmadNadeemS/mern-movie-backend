const { isValidObjectId } = require("mongoose");
const cloudinary = require("../cloud");
const { BadRequestError } = require("../errors");
const Actor = require("../models/Actor");
const { formatActor } = require("../utils/helper");

exports.createActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const newActor = new Actor({ name, about, gender });
  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        gravity: "face",
        height: 500,
        width: 500,
        crop: "thumb",
      }
    );
    newActor.avatar = { url, public_id };
  }
  await newActor.save();
  res.status(201).json({
    id: newActor._id,
    name,
    about,
    gender,
    avatar: newActor.avatar?.url,
  });
};

exports.getSingleActor = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new BadRequestError("Invalid id");
  const actor = await Actor.findById(id);
  if (!actor) {
    throw new BadRequestError("Invalid id");
  }

  res.status(200).json({
    actor: formatActor(actor),
  });
};

exports.updateActor = async (req, res) => {
  const { name, about, gender } = req.body;
  const { file } = req;
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid id");
  const actor = await Actor.findById(id);
  if (!actor) {
    throw new BadRequestError("Invalid id");
  }

  const public_id = actor.avatar?.public_id;
  if (public_id && file) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      throw new BadRequestError("cant delete image");
    }
  }
  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        gravity: "face",
        height: 500,
        width: 500,
        crop: "thumb",
      }
    );
    actor.avatar = { url, public_id };
  }
  actor.name = name;
  actor.about = about;
  actor.gender = gender;
  await actor.save();
  res.status(201).json({
    actor: formatActor(actor),
  });
};

exports.removeActor = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid id");
  const actorExists = await Actor.findById(id);
  if (!actorExists) {
    throw new BadRequestError("Invalid id");
  }

  const public_id = actorExists.avatar?.public_id;
  if (public_id) {
    const { result } = await cloudinary.uploader.destroy(public_id);
    if (result !== "ok") {
      throw new BadRequestError("cant delete image");
    }
  }
  await Actor.findByIdAndDelete(id);

  res.json({
    message: "Removed Successfully",
  });
};

exports.searchActor = async (req, res) => {
  const { name } = req.query;
  //   const result = await Actor.find({
  //     $text: {
  //       $search: `"${name}"`,
  //     },
  //   });
  if (!name.trim()) throw new BadRequestError("Invalid Request");
  const result = await Actor.find({
    name: {
      $regex: name,
      $options: "i",
    },
  });
  const actors = result.map((actor) => {
    return {
      id: actor._id,
      name: actor.name,
      about: actor.about,
      gender: actor.gender,
      avatar: actor.avatar?.url,
    };
  });

  res.json({
    results: actors,
  });
};

exports.getLatestActor = async (req, res) => {
  const result = await Actor.find({})
    .sort({
      createdAt: "-1",
    })
    .limit(12);

  res.json({
    result,
  });
};

exports.getActors = async (req, res) => {
  console.log("calledinside");
  const { pageNo, limit } = req.query;
  const actors = await Actor.find({})
    .sort({ createdAt: "-1" })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));
  const profiles = actors.map((actor) => {
    return {
      id: actor._id,
      name: actor.name,
      about: actor.about,
      gender: actor.gender,
      avatar: actor.avatar?.url,
    };
  });
  res.json({
    profiles,
  });
};
