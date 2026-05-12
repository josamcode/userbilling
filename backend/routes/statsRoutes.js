const express = require("express");
const { getStats } = require("../controllers/statsController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.get("/", getStats);

module.exports = router;
