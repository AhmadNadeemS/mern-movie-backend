const { isValidObjectId } = require("mongoose");
const cloudinary = require("../cloud");
const BadRequestError = require("../errors/bad-request");
const Movie = require("../models/Movie");
const Review = require("../models/Review");
const {
  formatActor,
  averageRatingPipeline,
  relatedMovieAggregation,
  getAverageRatings,
  topRatedMoviesPipeline,
} = require("../utils/helper");

exports.uploadTrailer = async (req, res) => {
  const { file } = req;
  if (!file) {
    throw new BadRequestError("video file missing");
  }
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file.path,
    {
      resource_type: "video",
    }
  );
  res.json({
    url,
    public_id,
  });
};

exports.createMovie = async (req, res) => {
  const { file, body } = req;
  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    reviews,
    language,
  } = body;
  const newMovie = new Movie({
    title,
    storyLine,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    reviews,
    language,
  });
  if (director) {
    if (!isValidObjectId(director)) {
      throw new BadRequestError("Invalid director id");
    }
    newMovie.director = director;
  }
  if (writers) {
    for (let writer of writers) {
      if (!isValidObjectId(writer)) {
        throw new BadRequestError("Invalid writer id");
      }
      newMovie.writers = writers;
    }
  }
  //   if (!file) {
  //     throw new BadRequestError("poster missing");
  //   }
  if (file) {
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });
    const finalPoster = { url, public_id, responsive: [] };
    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalPoster.responsive.push(secure_url);
      }
    }
    newMovie.poster = finalPoster;
  }
  await newMovie.save();
  res.status(200).json({
    movie: {
      id: newMovie._id,
    },
  });
};

exports.updateMovie = async (req, res) => {
  const { file, body } = req;
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid id");
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new BadRequestError("movie not found");
  }
  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    language,
  } = body;
  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.cast = cast;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director)) {
      throw new BadRequestError("Invalid id");
    }
    movie.director = director;
  }
  if (writers) {
    for (let writer of writers) {
      if (!isValidObjectId(writer)) {
        throw new BadRequestError("Invalid id");
      }
      movie.writers = writers;
    }
  }

  if (file) {
    const posterID = movie.poster?.public_id;
    if (posterID) {
      const { result } = await cloudinary.uploader.destroy(posterID);
      //   console.log(result);
      if (result !== "ok") {
        throw new BadRequestError("Could not remove the image");
      }
    }
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });
    const finalPoster = { url, public_id, responsive: [] };
    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalPoster.responsive.push(secure_url);
      }
    }
    movie.poster = finalPoster;
  }

  await movie.save();
  res.status(200).json({
    message: "Movie has been updated",
    movie: {
      id: movie._id,
      title: movie.title,
      poster: movie.poster?.url,
      genres: movie.genres,
      status: movie.status,
    },
  });
};

exports.updateMovieWithoutPoster = async (req, res) => {
  const { body } = req;
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid id");
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new BadRequestError("movie not found");
  }

  const {
    title,
    storyLine,
    director,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    writers,
    trailer,
    reviews,
    language,
  } = body;
  movie.title = title;
  movie.storyLine = storyLine;
  movie.tags = tags;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.trailer = trailer;
  movie.cast = cast;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director)) {
      throw new BadRequestError("Invalid id");
    }
    movie.director = director;
  }
  if (writers) {
    for (let writer of writers) {
      if (!isValidObjectId(writer)) {
        throw new BadRequestError("Invalid id");
      }
      movie.writers = writers;
    }
  }

  await movie.save();
  res.status(200).json({
    movie,
  });
};

exports.removeMovie = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Invalid id");
  const movie = await Movie.findById(id);
  if (!movie) {
    throw new BadRequestError("movie not found");
  }
  const posterID = movie.poster?.public_id;
  if (posterID) {
    const { result } = await cloudinary.uploader.destroy(posterID);
    if (result !== "ok") {
      throw new BadRequestError("Could not remove the image");
    }
  }

  const trailerID = movie.trailer?.public_id;
  if (trailerID) {
    const { result } = await cloudinary.uploader.destroy(trailerID, {
      resource_type: "video",
    });
    if (result !== "ok") {
      throw new BadRequestError("Could not remove the trailer");
    }
  }
  await Movie.findByIdAndDelete(movie);
  res.json({ message: "Movie removed successfully!!" });
};

exports.getMovies = async (req, res) => {
  const { pageNo = 0, limit = 20 } = req.query;
  const movies = await Movie.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));
  const results = movies.map((movie) => ({
    id: movie._id,
    title: movie.title,
    poster: movie.poster?.url,
    responsivePosters: movie.poster?.responsive,
    genres: movie.genres,
    status: movie.status,
  }));
  res.json({
    movies: results,
  });
};

exports.getMovieForUpdate = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new BadRequestError("Id is Invalid");
  const movie = await Movie.findById(id).populate(
    "writers director cast.actor"
  );
  res.json({
    movie: {
      id: movie._id,
      title: movie.title,
      storyLine: movie.storyLine,
      poster: movie.poster?.url,
      releaseDate: movie.releaseDate,
      status: movie.status,
      type: movie.type,
      language: movie.language,
      genres: movie.genres,
      tags: movie.tags,
      director: formatActor(movie.director),
      writers: movie.writers.map((w) => formatActor(w)),
      cast: movie.cast.map((c) => {
        return {
          id: c.id,
          profile: formatActor(c.actor),
          roleAs: c.roleAs,
          leadActor: c.leadActor,
        };
      }),
    },
  });
};

exports.searchMovies = async (req, res) => {
  const { title } = req.query;
  const movies = await Movie.find({
    title: {
      $regex: title,
      $options: "i",
    },
  });
  res.json({
    results: movies.map((m) => {
      return {
        id: m._id,
        title: m.title,
        status: m.status,
        poster: m.poster?.url,
        genres: m.genres,
      };
    }),
  });
};

exports.getLatestUploads = async (req, res) => {
  const { limit = 5 } = req.query;
  const results = await Movie.find({ status: "public" })
    .sort("-createdAt")
    .limit(parseInt(limit));
  const movies = results.map((m) => {
    return {
      id: m._id,
      title: m.title,
      storyLine: m.storyLine,
      poster: m.poster?.url,
      responsivePosters: m.poster?.responsive,
      trailer: m.trailer?.url,
    };
  });
  res.json({ movies });
};

exports.getSingleMovie = async (req, res) => {
  const { movieId } = req.params;

  if (!isValidObjectId(movieId)) throw new BadRequestError("Id is Invalid");
  const movie = await Movie.findById(movieId).populate(
    "director writers cast.actor"
  );
  const {
    _id: id,
    title,
    storyLine,
    cast,
    writers,
    director,
    releaseDate,
    genres,
    tags,
    language,
    poster,
    trailer,
    type,
  } = movie;

  //   const [aggregatedResponse] = await Review.aggregate(
  //     averageRatingPipeline(movie._id)
  //   );

  //   const reviews = {};
  //   if (aggregatedResponse) {
  //     const { ratingAvg, reviewCount } = aggregatedResponse;
  //     reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1);
  //     reviews.reviewCount = reviewCount;
  //   }

  const reviews = await getAverageRatings(movie._id);
  res.json({
    movie: {
      id,
      title,
      storyLine,
      releaseDate,
      genres,
      tags,
      language,
      type,
      poster: poster?.url,
      trailer: trailer?.url,
      cast: cast.map((c) => ({
        id: c._id,
        profile: {
          id: c.actor._id,
          name: c.actor.name,
          avatar: c.actor?.avatar?.url,
        },
        leadActor: c.leadActor,
        roleAs: c.roleAs,
      })),
      writers: writers.map((w) => ({
        id: w._id,
        name: w.name,
      })),
      director: {
        id: director._id,
        name: director.name,
      },
      reviews: { ...reviews },
    },
  });
};

exports.getRelatedMovies = async (req, res) => {
  const { movieId } = req.params;
  if (!isValidObjectId(movieId)) throw new BadRequestError("Id is Invalid");
  const movie = await Movie.findById(movieId);
  const movies = await Movie.aggregate(
    relatedMovieAggregation(movie.tags, movie._id)
  );
  const mapMovies = async (m) => {
    const reviews = await getAverageRatings(m._id);
    return {
      id: m._id,
      title: m.title,
      poster: m.poster,
      responsivePosters: m.responsivePosters,
      reviews: { ...reviews },
    };
  };

  const relatedMovies = await Promise.all(movies.map(mapMovies));
  res.json({ movies: relatedMovies });
};

exports.getTopRatedMovies = async (req, res) => {
  const { type = "Film" } = req.query;
  const movies = await Movie.aggregate(topRatedMoviesPipeline(type));
  const mapMovies = async (m) => {
    const reviews = await getAverageRatings(m._id);
    return {
      id: m._id,
      title: m.title,
      poster: m.poster,
      responsivePosters: m.responsivePosters,
      reviews: { ...reviews },
    };
  };

  const topRatedMovies = await Promise.all(movies.map(mapMovies));

  res.json({ movies: topRatedMovies });
};

exports.searchPublicMovies = async (req, res) => {
  const { title } = req.query;
  const movies = await Movie.find({
    title: {
      $regex: title,
      $options: "i",
    },
    status: "public",
  });
  const mapMovies = async (m) => {
    const reviews = await getAverageRatings(m._id);
    return {
      id: m._id,
      title: m.title,
      poster: m.poster?.url,
      responsivePosters: m.poster?.responsive,
      reviews: { ...reviews },
    };
  };

  const results = await Promise.all(movies.map(mapMovies));
  res.json({
    results,
  });
};
