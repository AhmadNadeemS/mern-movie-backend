const crypto = require("crypto");
const Review = require("../models/Review");

exports.generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) throw reject(err);
      const buffString = buff.toString("hex");
      resolve(buffString);
    });
  });
};

exports.formatActor = (actor) => {
  const { name, about, gender, _id, avatar } = actor;
  return {
    id: _id,
    name,
    about,
    gender,
    avatar: avatar?.url,
  };
};

exports.averageRatingPipeline = (id) => {
  return [
    {
      $lookup: {
        from: "Review",
        localField: "rating",
        foreignField: "_id",
        as: "avgRat",
      },
    },
    {
      $match: {
        parentMovie: id,
      },
    },
    {
      $group: {
        _id: null,
        ratingAvg: {
          $avg: "$rating",
        },
        reviewCount: {
          $sum: 1,
        },
      },
    },
  ];
};

exports.relatedMovieAggregation = (tags, movieId) => {
  return [
    {
      $lookup: {
        from: "Movie",
        localField: "tags",
        foreignField: "_id",
        as: "relatedMovies",
      },
    },
    {
      $match: {
        tags: { $in: [...tags] },
        _id: { $ne: movieId },
      },
    },
    {
      $project: {
        title: 1,
        poster: "$poster.url",
        responsivePosters: "$poster.responsive",
      },
    },
    {
      $limit: 5,
    },
  ];
};

exports.topRatedMoviesPipeline = (type) => {
  const matchOptions = {
    reviews: { $exists: true },
    status: { $eq: "public" },
    //   type: { $eq: type },
  };
  if (type) matchOptions.type = { $eq: type };
  return [
    {
      $lookup: {
        from: "Movie",
        localField: "reviews",
        foreignField: "_id",
        as: "topRated",
      },
    },
    {
      //   $match: {
      //     reviews: { $exists: true },
      //     status: { $eq: "public" },
      //     type: { $eq: type },
      //   },
      $match: matchOptions,
    },
    {
      $project: {
        title: 1,
        poster: "$poster.url",
        responsivePosters: "$poster.responsive",
        reviewCount: { $size: "$reviews" },
      },
    },
    {
      $sort: { reviewCount: -1 },
    },
    {
      $limit: 5,
    },
  ];
};

exports.getAverageRatings = async (movieId) => {
  const [aggregatedResponse] = await Review.aggregate(
    this.averageRatingPipeline(movieId)
  );

  const reviews = {};
  if (aggregatedResponse) {
    const { ratingAvg, reviewCount } = aggregatedResponse;
    reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1);
    reviews.reviewCount = reviewCount;
  }
  return reviews;
};
