const express = require("express");
const {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  addPayment,
} = require("../controllers/billController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

router.get("/", getBills);
router.get("/:id", getBillById);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);
router.post("/:id/payments", addPayment);

module.exports = router;
