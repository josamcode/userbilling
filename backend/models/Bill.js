const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dateOfCall: { type: Date, required: false },
  billDate: { type: Date, required: false },
  customerName: { type: String, required: true },
  billPrice: { type: Number, required: true },
  state: {
    type: String,
    enum: ["pending", "paid"], // Define possible states
    default: "pending", // Set a default state
  },
  discription: { type: String, required: false },
});

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
