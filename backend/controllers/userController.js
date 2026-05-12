const mongoose = require("mongoose");
const User = require("../models/User");
const Bill = require("../models/Bill");
const { uploadBuffer, destroyImage } = require("../lib/cloudinary");
const { normalizeBill } = require("../lib/billUtils");

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function badRequest(res, message) {
  return res.status(400).json({ message });
}

async function uploadIfFile(file) {
  if (!file) return null;
  const result = await uploadBuffer(file.buffer, {
    public_id: `user_${Date.now()}`,
  });
  return { imageUrl: result.secure_url, imagePublicId: result.public_id };
}

exports.getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search && String(search).trim()) {
      const s = String(search).trim();
      const re = new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: re }, { email: re }, { country: re }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "العميل غير موجود" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserBills = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }
    const bills = await Bill.find({ userId: req.params.id })
      .sort({ billDate: -1, createdAt: -1 })
      .lean();
    res.json(bills.map(normalizeBill));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "العميل غير موجود" });

    const bills = await Bill.find({ userId: user._id })
      .sort({ billDate: -1, createdAt: -1 })
      .lean();
    const normalized = bills.map(normalizeBill);

    const summary = normalized.reduce(
      (acc, b) => {
        acc.totalBilled += b.totalAmount;
        acc.totalPaid += b.paidAmount;
        acc.totalRemaining += b.remainingAmount;
        acc.billCount += 1;
        acc.byStatus[b.paymentStatus] =
          (acc.byStatus[b.paymentStatus] || 0) + 1;
        return acc;
      },
      {
        totalBilled: 0,
        totalPaid: 0,
        totalRemaining: 0,
        billCount: 0,
        byStatus: { paid: 0, partial: 0, unpaid: 0 },
      }
    );

    // Round monetary totals to 2 decimals.
    summary.totalBilled = Math.round(summary.totalBilled * 100) / 100;
    summary.totalPaid = Math.round(summary.totalPaid * 100) / 100;
    summary.totalRemaining = Math.round(summary.totalRemaining * 100) / 100;

    res.json({ user, bills: normalized, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const country = String(req.body.country || "").trim();

    if (!name) return badRequest(res, "الاسم مطلوب");
    if (!email || !EMAIL_RE.test(email))
      return badRequest(res, "البريد الإلكتروني غير صالح");
    if (!country) return badRequest(res, "الدولة مطلوبة");

    const dup = await User.findOne({ email });
    if (dup) return res.status(409).json({ message: "هذا البريد مستخدم بالفعل" });

    const image = await uploadIfFile(req.file);

    const user = await User.create({
      name,
      email,
      country,
      ...(image || {}),
    });
    res.status(201).json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "هذا البريد مستخدم بالفعل" });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }
    const existing = await User.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "العميل غير موجود" });

    const update = {};
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) return badRequest(res, "الاسم مطلوب");
      update.name = name;
    }
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!email || !EMAIL_RE.test(email))
        return badRequest(res, "البريد الإلكتروني غير صالح");
      if (email !== existing.email) {
        const dup = await User.findOne({ email });
        if (dup) return res.status(409).json({ message: "هذا البريد مستخدم بالفعل" });
        update.email = email;
      }
    }
    if (req.body.country !== undefined) {
      const country = String(req.body.country).trim();
      if (!country) return badRequest(res, "الدولة مطلوبة");
      update.country = country;
    }

    if (req.file) {
      const image = await uploadIfFile(req.file);
      if (existing.imagePublicId) {
        destroyImage(existing.imagePublicId).catch(() => {});
      }
      update.imageUrl = image.imageUrl;
      update.imagePublicId = image.imagePublicId;
      update.image = ""; // clear legacy filename so URL takes precedence
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    res.json(user);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "هذا البريد مستخدم بالفعل" });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "العميل غير موجود" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "العميل غير موجود" });
    if (user.imagePublicId) {
      destroyImage(user.imagePublicId).catch(() => {});
    }
    res.json({ message: "تم حذف العميل" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
