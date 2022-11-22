const {
  uploadTrailer,
  createMovie,
  updateMovieWithPoster,
  updateMovieWithoutPoster,
  removeMovie,
  getMovies,
  getMovieForUpdate,
  updateMovie,
  searchMovies,
  getLatestUploads,
  getSingleMovie,
  getRelatedMovies,
  getTopRatedMovies,
  searchPublicMovies,
} = require("../controllers/movieController");
const { parseData } = require("../middleware/helper");
const { isAuth, isAdmin } = require("../middleware/isAuth");
const { uploadImage, uploadVideo } = require("../middleware/multer");

const router = require("express").Router();

router.post(
  "/upload-trailer",
  isAuth,
  isAdmin,
  uploadVideo.single("video"),
  uploadTrailer
);

router.post(
  "/create",
  isAuth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  createMovie
);

router.patch(
  "/update/:id",
  isAuth,
  isAdmin,
  uploadImage.single("poster"),
  parseData,
  updateMovie
);

// router.patch(
//   "/update-movie-without-poster/:id",
//   //   uploadImage.single("poster"),
//   updateMovieWithoutPoster
// );

router.delete(
  "/:id",
  //   uploadImage.single("poster"),
  removeMovie
);

router.get("/movies", isAuth, isAdmin, getMovies);

router.get("/search", isAuth, isAdmin, searchMovies);

router.get("/for-update/:id", isAuth, isAdmin, getMovieForUpdate);

//for normal users

router.get("/latest-uploads", getLatestUploads);
router.get("/single/:movieId", getSingleMovie);
router.get("/related/:movieId", getRelatedMovies);
router.get("/top-rated", getTopRatedMovies);
router.get("/search-public", searchPublicMovies);

module.exports = router;
