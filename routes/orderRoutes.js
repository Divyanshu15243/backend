const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrderCustomer,
  updateOrder,
  deleteOrder,
  getDashboardOrders,
  getDashboardRecentOrder,
  getBestSellerProductChart,
  getDashboardCount,
  getDashboardAmount,
  addPosOrder,
} = require("../controller/orderController");

// monthly report
router.get("/monthly-report", async (req, res) => {
  try {
    const Order = require("../models/Order");
    const { month, year } = req.query;
    const m = parseInt(month);
    const y = parseInt(year);

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const orders = await Order.find({
      createdAt: { $gte: start, $lt: end },
    }).sort({ createdAt: 1 });

    const summary = {
      totalOrders: orders.length,
      totalSales: orders.reduce((s, o) => s + (o.total || 0), 0),
      totalDiscount: orders.reduce((s, o) => s + (o.discount || 0), 0),
      totalShipping: orders.reduce((s, o) => s + (o.shippingCost || 0), 0),
      totalProfit: orders.reduce((s, o) => s + (o.totalProfit || 0), 0),
      ownerProfit: orders.reduce((s, o) => s + (o.ownerProfit || 0), 0),
      referralCommission: orders.reduce((s, o) => s + (o.referralCommission || 0), 0),
      cashOrders: orders.filter(o => o.paymentMethod === "Cash").length,
      onlineOrders: orders.filter(o => o.paymentMethod !== "Cash").length,
      deliveredOrders: orders.filter(o => /delivered/i.test(o.status)).length,
      pendingOrders: orders.filter(o => /pending/i.test(o.status)).length,
      posOrders: orders.filter(o => o.orderSource === "POS").length,
    };

    res.send({ orders, summary, month: m, year: y });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//get all orders
router.get("/", getAllOrders);

// add POS order (admin)
router.post("/pos/add", addPosOrder);

// get dashboard orders data
router.get("/dashboard", getDashboardOrders);

// dashboard recent-order
router.get("/dashboard-recent-order", getDashboardRecentOrder);

// dashboard order count
router.get("/dashboard-count", getDashboardCount);

// dashboard order amount
router.get("/dashboard-amount", getDashboardAmount);

// chart data for product
router.get("/best-seller/chart", getBestSellerProductChart);

//get all order by a user
router.get("/customer/:id", getOrderCustomer);

//get a order by id
router.get("/:id", getOrderById);

//update a order
router.put("/:id", updateOrder);

//delete a order
router.delete("/:id", deleteOrder);

module.exports = router;
