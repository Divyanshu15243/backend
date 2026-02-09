const Transaction = require("../models/Transaction");
const Customer = require("../models/Customer");

// Get wallet balance and transactions
const getWalletDetails = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select("walletBalance");
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("order", "invoice")
      .sort({ createdAt: -1 })
      .limit(50);

    res.send({
      walletBalance: customer.walletBalance || 0,
      transactions,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// Get all transactions with pagination
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const totalDoc = await Transaction.countDocuments({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("order", "invoice")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.send({
      transactions,
      totalDoc,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  getWalletDetails,
  getTransactions,
};
