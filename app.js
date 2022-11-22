require("dotenv").config();
require("express-async-errors");
const morgan = require("morgan");
const express = require("express");
const connectDB = require("./db");
const cors = require("cors");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authRoutes = require("./routes/authRoutes");
const actorRoutes = require("./routes/actorRoutes");
const movieRoutes = require("./routes/movieRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();
app.use(morgan("dev"));

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/actor", actorRoutes);
app.use("/api/movie", movieRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
// console.log(actors);
// Actor.insertMany(actors);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);

    app.listen(PORT, () => {
      console.log("Port is " + PORT);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
