const Bill = require("../models/Bill");

// Get all bills
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find();
    res.status(200).json(bills);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// exports.getBillsByFilter = async (req, res) => {
//   try {
//     const filter = req.query.state ? { state: req.query.state } : {}; // Filter by state if provided
//     const bills = await Bill.find(filter);
//     res.status(200).json(bills);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// Create a new bill
exports.createBill = async (req, res) => {
  const { amount, dateOfCall, billDate, customerName, billPrice, state, discription } = req.body;

  try {
    const bill = new Bill({
      amount,
      dateOfCall,
      billDate,
      customerName,
      billPrice,
      state: state || "pending", // Default to pending if not provided
      discription,
    });

    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Update an existing bill
exports.updateBill = async (req, res) => {
  const { id } = req.params;
  const { amount, dateOfCall, billDate, customerName, billPrice, state, discription } = req.body;

  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { amount, dateOfCall, billDate, customerName, billPrice, state, discription },
      { new: true, runValidators: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ status: "fail", message: "Bill not found" });
    }

    res.status(200).json(updatedBill);
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Delete a bill
exports.deleteBill = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res.status(404).json({ status: "fail", message: "Bill not found" });
    }

    res.status(200).json({ status: "success", message: "Bill deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
