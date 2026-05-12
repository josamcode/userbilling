const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ["cash", "bank_transfer", "other"],
      default: "cash",
    },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const billSchema = new mongoose.Schema(
  {
    // Optional link to a real client. Old bills won't have it.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    // Display-stable snapshot of the client name at creation time.
    customerNameSnapshot: { type: String, required: false, trim: true },
    // Legacy free-text customer name kept for backward compatibility.
    customerName: { type: String, required: false, trim: true },

    amount: { type: Number, required: true, min: 0 },
    billPrice: { type: Number, required: true, min: 0 },
    // billDate now stores date + time
    billDate: { type: Date, required: false },
    dateOfCall: { type: Date, required: false },

    // Legacy enum kept for backward compatibility. Derived paymentStatus is the
    // authoritative one going forward.
    state: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    // Correct field; old data uses `discription` and is read with fallback.
    description: { type: String, required: false, trim: true },
    discription: { type: String, required: false, trim: true }, // legacy

    payments: { type: [paymentSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
