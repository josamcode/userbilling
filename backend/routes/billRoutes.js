const express = require("express");
const { getBills, createBill, updateBill, deleteBill } = require("../controllers/billController");

const router = express.Router();

// Get all bills
router.get("/", getBills);

// Create a new bill
router.post("/", createBill);

// Update an existing bill by ID
router.put("/:id", updateBill);

// Delete a bill by ID
router.delete("/:id", deleteBill);

module.exports = router;
