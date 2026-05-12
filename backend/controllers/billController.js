const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const User = require("../models/User");
const { computePayments, normalizeBill } = require("../lib/billUtils");

function parseDate(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function badRequest(res, message) {
  return res.status(400).json({ message });
}

exports.getBills = async (req, res) => {
  try {
    const { search, state, status } = req.query;
    const filter = {};
    if (state === "pending" || state === "paid") {
      filter.state = state;
    }

    let bills = await Bill.find(filter)
      .populate("userId", "name email country image imageUrl")
      .sort({ createdAt: -1 })
      .lean();

    if (search && String(search).trim()) {
      const s = String(search).trim().toLowerCase();
      bills = bills.filter((b) => {
        const name =
          (b.userId && b.userId.name) ||
          b.customerNameSnapshot ||
          b.customerName ||
          "";
        return name.toLowerCase().includes(s);
      });
    }

    const normalized = bills.map(normalizeBill);

    // Optional filter by computed payment status: paid|partial|unpaid
    if (status === "paid" || status === "partial" || status === "unpaid") {
      return res.json(normalized.filter((b) => b.paymentStatus === status));
    }

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBillById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    const bill = await Bill.findById(req.params.id)
      .populate("userId", "name email country image imageUrl")
      .lean();
    if (!bill) return res.status(404).json({ message: "الفاتورة غير موجودة" });
    res.json(normalizeBill(bill));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBill = async (req, res) => {
  try {
    const {
      userId,
      customerName,
      amount,
      billPrice,
      description,
    } = req.body || {};

    const billDate = parseDate(req.body.billDate);
    const dateOfCall = parseDate(req.body.dateOfCall);
    if (billDate === null) return badRequest(res, "تاريخ الفاتورة غير صالح");
    if (dateOfCall === null) return badRequest(res, "تاريخ المكالمة غير صالح");

    const amountNum = Number(amount);
    const priceNum = Number(billPrice);
    if (!Number.isFinite(amountNum) || amountNum <= 0)
      return badRequest(res, "الكمية يجب أن تكون رقم موجب");
    if (!Number.isFinite(priceNum) || priceNum <= 0)
      return badRequest(res, "السعر يجب أن يكون رقم موجب");

    let resolvedUserId;
    let snapshotName = "";
    if (userId) {
      if (!mongoose.isValidObjectId(userId)) {
        return badRequest(res, "العميل غير صالح");
      }
      const user = await User.findById(userId).lean();
      if (!user) return badRequest(res, "العميل غير موجود");
      resolvedUserId = user._id;
      snapshotName = user.name;
    } else if (customerName && String(customerName).trim()) {
      snapshotName = String(customerName).trim();
    } else {
      return badRequest(res, "يجب اختيار عميل أو إدخال اسم");
    }

    const bill = await Bill.create({
      userId: resolvedUserId,
      customerNameSnapshot: snapshotName,
      customerName: snapshotName,
      amount: amountNum,
      billPrice: priceNum,
      billDate,
      dateOfCall,
      state: "pending", // new bills always start unpaid; payments drive status
      description: description ? String(description).trim() : "",
      payments: [],
    });
    const populated = await bill.populate(
      "userId",
      "name email country image imageUrl"
    );
    res.status(201).json(normalizeBill(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBill = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    const existing = await Bill.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "الفاتورة غير موجودة" });

    const update = {};
    if (req.body.amount !== undefined) {
      const n = Number(req.body.amount);
      if (!Number.isFinite(n) || n <= 0)
        return badRequest(res, "الكمية يجب أن تكون رقم موجب");
      update.amount = n;
    }
    if (req.body.billPrice !== undefined) {
      const n = Number(req.body.billPrice);
      if (!Number.isFinite(n) || n <= 0)
        return badRequest(res, "السعر يجب أن يكون رقم موجب");
      // Block reducing total below already-paid amount.
      const computed = computePayments({
        billPrice: existing.billPrice,
        payments: existing.payments,
        state: existing.state,
      });
      if (n < computed.paidAmount) {
        return badRequest(
          res,
          "لا يمكن جعل إجمالي الفاتورة أقل من المبلغ المدفوع"
        );
      }
      update.billPrice = n;
    }
    if (req.body.billDate !== undefined) {
      const d = parseDate(req.body.billDate);
      if (d === null) return badRequest(res, "تاريخ الفاتورة غير صالح");
      update.billDate = d;
    }
    if (req.body.dateOfCall !== undefined) {
      const d = parseDate(req.body.dateOfCall);
      if (d === null) return badRequest(res, "تاريخ المكالمة غير صالح");
      update.dateOfCall = d;
    }
    if (req.body.description !== undefined) {
      update.description = String(req.body.description || "").trim();
      update.discription = ""; // clear legacy
    }
    if (req.body.userId !== undefined) {
      if (req.body.userId === null || req.body.userId === "") {
        update.userId = null;
      } else {
        if (!mongoose.isValidObjectId(req.body.userId)) {
          return badRequest(res, "العميل غير صالح");
        }
        const user = await User.findById(req.body.userId).lean();
        if (!user) return badRequest(res, "العميل غير موجود");
        update.userId = user._id;
        update.customerNameSnapshot = user.name;
        update.customerName = user.name;
      }
    } else if (req.body.customerName !== undefined && !existing.userId) {
      const name = String(req.body.customerName).trim();
      if (!name) return badRequest(res, "اسم العميل مطلوب");
      update.customerName = name;
      update.customerNameSnapshot = name;
    }

    // Note: payment status is derived from payments. We deliberately do NOT
    // accept `state` from the client edit form.

    const bill = await Bill.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).populate("userId", "name email country image imageUrl");

    res.json(normalizeBill(bill));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) return res.status(404).json({ message: "الفاتورة غير موجودة" });
    res.json({ message: "تم حذف الفاتورة" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "الفاتورة غير موجودة" });
    }
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "الفاتورة غير موجودة" });

    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return badRequest(res, "المبلغ يجب أن يكون رقم موجب");
    }

    let paidAt = new Date();
    if (req.body.paidAt) {
      paidAt = new Date(req.body.paidAt);
      if (isNaN(paidAt.getTime())) {
        return badRequest(res, "تاريخ الدفعة غير صالح");
      }
    }

    const method =
      req.body.method &&
      ["cash", "bank_transfer", "other"].includes(req.body.method)
        ? req.body.method
        : "cash";
    const note = req.body.note ? String(req.body.note).trim() : "";

    const current = computePayments({
      billPrice: bill.billPrice,
      payments: bill.payments,
      state: bill.state,
    });

    if (current.remainingAmount <= 0) {
      return badRequest(res, "الفاتورة مدفوعة بالكامل بالفعل");
    }
    if (amount > current.remainingAmount + 0.001) {
      return badRequest(
        res,
        `المبلغ يتجاوز المتبقي على الفاتورة (${current.remainingAmount})`
      );
    }

    bill.payments.push({ amount, paidAt, method, note });

    // Sync legacy state so older clients keep seeing the right state.
    const next = computePayments({
      billPrice: bill.billPrice,
      payments: bill.payments,
      state: bill.state,
    });
    bill.state = next.paymentStatus === "paid" ? "paid" : "pending";

    await bill.save();
    const populated = await bill.populate(
      "userId",
      "name email country image imageUrl"
    );
    res.status(201).json(normalizeBill(populated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
