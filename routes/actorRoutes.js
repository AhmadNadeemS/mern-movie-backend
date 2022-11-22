const {
  createActor,
  updateActor,
  removeActor,
  searchActor,
  getLatestActor,
  getSingleActor,
  getActors,
} = require("../controllers/actorController");
const { isAuth, isAdmin } = require("../middleware/isAuth");
const { uploadImage } = require("../middleware/multer");
const { validatorActor, validate } = require("../middleware/validator");

const router = require("express").Router();

router.post(
  "/create",
  isAuth,
  isAdmin,
  uploadImage.single("avatar"),
  validatorActor,
  validate,
  createActor
);

router.post(
  "/update/:id",
  isAuth,
  isAdmin,
  uploadImage.single("avatar"),
  validatorActor,
  validate,
  updateActor
);

router.delete("/:id", isAuth, isAdmin, removeActor);

router.get("/search", searchActor);

router.get("/latest-uploads", getLatestActor);

router.get("/actors", isAuth, isAdmin, getActors);

router.get("/single/:id", getSingleActor);

module.exports = router;
