const { isValidObjectId } = require("mongoose");
const { BadRequestError } = require("../errors");
const Movie = require("../models/Movie");
const Review = require("../models/Review");
const { getAverageRatings } = require("../utils/helper");

exports.addReview = async (req, res) => {
  const { movieId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;
  console.log(req.user.isVerified);
  if (!req.user.isVerified) {
    throw new BadRequestError("Please verify your email first!");
  }
  if (!isValidObjectId(movieId)) throw new BadRequestError("Invalid id");
  const movie = await Movie.findOne({ _id: movieId, status: "public" });
  if (!movie) {
    throw new BadRequestError("movie not found");
  }
  const isAlreadyReviewed = await Review.findOne({
    owner: userId,
    parentMovie: movie._id,
  });
  if (isAlreadyReviewed) {
    throw new BadRequestError("already reviewed");
  }
  const newReview = new Review({
    owner: userId,
    content,
    rating,
    parentMovie: movie._id,
  });
  movie.reviews.push(newReview._id);
  await movie.save();
  await newReview.save();

  const reviews = await getAverageRatings(movie._id);

  res.json({ message: "Your review has been added.", reviews });
};

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;
  if (!isValidObjectId(reviewId)) throw new BadRequestError("Invalid id");

  const review = await Review.findOne({
    owner: userId,
    _id: reviewId,
  });
  if (!review) {
    throw new BadRequestError("review not found");
  }
  review.content = content;
  review.rating = rating;

  await review.save();

  res.json({ message: "Your review has been updated." });
};

exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(reviewId)) throw new BadRequestError("Invalid id");

  const review = await Review.findOne({
    owner: userId,
    _id: reviewId,
  });
  if (!review) {
    throw new BadRequestError("review not found");
  }
  const movie = await Movie.findById(review.parentMovie).select("reviews");
  movie.reviews = movie.reviews.filter((id) => id.toString() !== reviewId);
  await Review.findByIdAndDelete(reviewId);
  await movie.save();

  res.json({ message: "Review removed successfully." });
};

exports.getReviewsByMovie = async (req, res) => {
  const { movieId } = req.params;
  if (!isValidObjectId(movieId)) throw new BadRequestError("Invalid id");
  const movie = await Movie.findById(movieId)
    .populate({
      path: "reviews",
      populate: {
        path: "owner",
        select: "name",
      },
    })
    .select("reviews title");
  if (!movie) {
    throw new BadRequestError("movie not found");
  }

  const reviews = movie.reviews.map((r) => {
    const { owner, content, rating, _id: reviewID } = r;
    const { name, _id: ownerId } = owner;
    return {
      id: reviewID,
      owner: {
        id: ownerId,
        name: name,
      },
      content,
      rating,
    };
  });

  res.json({ movie: { title: movie.title, reviews } });
};
