const Bill = require("../models/Bill");
const User = require("../models/User");
const { computePayments } = require("../lib/billUtils");

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, bills] = await Promise.all([
      User.countDocuments(),
      Bill.find(
        {},
        "billPrice payments state customerNameSnapshot customerName billDate createdAt userId"
      )
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    let totalBilled = 0;
    let totalPaid = 0;
    const counts = { paid: 0, partial: 0, unpaid: 0 };
    for (const b of bills) {
      const c = computePayments(b);
      totalBilled += c.totalAmount;
      totalPaid += c.paidAmount;
      counts[c.paymentStatus] = (counts[c.paymentStatus] || 0) + 1;
    }
    totalBilled = Math.round(totalBilled * 100) / 100;
    totalPaid = Math.round(totalPaid * 100) / 100;
    const totalRemaining = Math.round(Math.max(totalBilled - totalPaid, 0) * 100) / 100;

    const latest = bills.slice(0, 5).map((b) => {
      const c = computePayments(b);
      return {
        _id: b._id,
        displayName:
          (b.userId && b.userId.name) ||
          b.customerNameSnapshot ||
          b.customerName ||
          "",
        billPrice: b.billPrice,
        paidAmount: c.paidAmount,
        remainingAmount: c.remainingAmount,
        paymentStatus: c.paymentStatus,
        state: b.state, // legacy
        billDate: b.billDate,
        createdAt: b.createdAt,
      };
    });

    res.json({
      totalUsers,
      totalBills: bills.length,
      paidBills: counts.paid,
      partialBills: counts.partial,
      pendingBills: counts.unpaid, // alias kept for compatibility
      unpaidBills: counts.unpaid,
      totalBilled,
      totalPaid,
      totalRemaining,
      latest,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
