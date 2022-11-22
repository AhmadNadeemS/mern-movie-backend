const { getAppInfo, getMostRated } = require("../controllers/adminController");
const { isAuth, isAdmin } = require("../middleware/isAuth");
const router = require("express").Router();

router.get("/app-info", isAuth, isAdmin, getAppInfo);
router.get("/most-rated", isAuth, isAdmin, getMostRated);

module.exports = router;
