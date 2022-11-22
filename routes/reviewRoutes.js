const {
  addReview,
  updateReview,
  getReviewsByMovie,
  deleteReview,
} = require("../controllers/reviewController");
const { isAuth } = require("../middleware/isAuth");
const { validateRatings, validate } = require("../middleware/validator");

const router = require("express").Router();

router.post("/add/:movieId", isAuth, validateRatings, validate, addReview);

router.patch("/:reviewId", isAuth, updateReview);

router.delete("/:reviewId", isAuth, deleteReview);

router.get("/get-reviews-by-movie/:movieId", getReviewsByMovie);

module.exports = router;
