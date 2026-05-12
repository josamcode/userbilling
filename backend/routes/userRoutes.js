const express = require("express");
const multer = require("multer");
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserBills,
  getUserDetails,
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images are allowed"));
  },
});

router.use(requireAuth);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/:id/bills", getUserBills);
router.get("/:id/details", getUserDetails);
router.post("/", upload.single("image"), createUser);
router.put("/:id", upload.single("image"), updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
