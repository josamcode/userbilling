const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    country: { type: String, required: true, trim: true },
    // Legacy field: old records used a local filename string.
    image: { type: String, required: false },
    // New Cloudinary fields.
    imageUrl: { type: String, required: false },
    imagePublicId: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
