const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { calculateOrderProfit } = require("../lib/referral/commissionHelper");

const getAllOrders = async (req, res) => {
  const {
    day,
    status,
    page,
    limit,
    method,
    endDate,
    // download,
    // sellFrom,
    startDate,
    customerName,
  } = req.query;

  //  day count
  let date = new Date();
  const today = date.toString();
  date.setDate(date.getDate() - Number(day));
  const dateTime = date.toString();

  const beforeToday = new Date();
  beforeToday.setDate(beforeToday.getDate() - 1);
  // const before_today = beforeToday.toString();

  const startDateData = new Date(startDate);
  startDateData.setDate(startDateData.getDate());
  const start_date = startDateData.toString();

  // console.log(" start_date", start_date, endDate);

  const queryObject = {};

  if (!status) {
    queryObject.$or = [
      { status: { $regex: `Pending`, $options: "i" } },
      { status: { $regex: `Processing`, $options: "i" } },
      { status: { $regex: `Delivered`, $options: "i" } },
      { status: { $regex: `Cancel`, $options: "i" } },
      { status: { $regex: `POS-Completed`, $options: "i" } },
    ];
  }

  if (customerName) {
    queryObject.$or = [
      { "user_info.name": { $regex: `${customerName}`, $options: "i" } },
      { invoice: { $regex: `${customerName}`, $options: "i" } },
    ];
  }

  if (day) {
    queryObject.createdAt = { $gte: dateTime, $lte: today };
  }

  if (status) {
    queryObject.status = { $regex: `${status}`, $options: "i" };
  }

  if (startDate && endDate) {
    queryObject.updatedAt = {
      $gt: start_date,
      $lt: endDate,
    };
  }
  if (method) {
    queryObject.paymentMethod = { $regex: `${method}`, $options: "i" };
  }

  const pages = Number(page) || 1;
  const limits = Number(limit);
  const skip = (pages - 1) * limits;

  try {
    // total orders count
    const totalDoc = await Order.countDocuments(queryObject);
    const orders = await Order.find(queryObject)
      .select(
        "_id invoice paymentMethod subTotal total user_info discount shippingCost status createdAt updatedAt"
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits);

    let methodTotals = [];
    if (startDate && endDate) {
      // console.log("filter method total");
      const filteredOrders = await Order.find(queryObject, {
        _id: 1,
        // subTotal: 1,
        total: 1,

        paymentMethod: 1,
        // createdAt: 1,
        updatedAt: 1,
      }).sort({ updatedAt: -1 });
      for (const order of filteredOrders) {
        const { paymentMethod, total } = order;
        const existPayment = methodTotals.find(
          (item) => item.method === paymentMethod
        );

        if (existPayment) {
          existPayment.total += total;
        } else {
          methodTotals.push({
            method: paymentMethod,
            total: total,
          });
        }
      }
    }

    res.send({
      orders,
      limits,
      pages,
      totalDoc,
      methodTotals,
      // orderOverview,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getOrderCustomer = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ _id: -1 });
    res.send(orders);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    // console.log("getOrderById");

    const order = await Order.findById(req.params.id);
    res.send(order);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const newStatus = req.body.status;
    await Order.updateOne(
      { _id: req.params.id },
      { $set: { status: newStatus } }
    );
    res.status(200).send({ message: "Order Updated Successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await Order.deleteOne({ _id: req.params.id });
    res.status(200).send({ message: "Order Deleted Successfully!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// get dashboard recent order
const getDashboardRecentOrder = async (req, res) => {
  try {
    // console.log("getDashboardRecentOrder");

    const { page, limit } = req.query;

    const pages = Number(page) || 1;
    const limits = Number(limit) || 8;
    const skip = (pages - 1) * limits;

    const queryObject = {};

    queryObject.$or = [
      { status: { $regex: `Pending`, $options: "i" } },
      { status: { $regex: `Processing`, $options: "i" } },
      { status: { $regex: `Delivered`, $options: "i" } },
      { status: { $regex: `Cancel`, $options: "i" } },
    ];

    const totalDoc = await Order.countDocuments(queryObject);

    // query for orders
    const orders = await Order.find(queryObject)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limits);

    // console.log('order------------<', orders);

    res.send({
      orders: orders,
      page: page,
      limit: limit,
      totalOrder: totalDoc,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get dashboard count
const getDashboardCount = async (req, res) => {
  try {
    // console.log("getDashboardCount");

    const totalDoc = await Order.countDocuments();

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total processing order count
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: "Processing",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.send({
      totalOrder: totalDoc,
      totalPendingOrder: totalPendingOrder[0] || 0,
      totalProcessingOrder: totalProcessingOrder[0]?.count || 0,
      totalDeliveredOrder: totalDeliveredOrder[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getDashboardAmount = async (req, res) => {
  const now = new Date();

  // today: midnight to now
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // yesterday: midnight to midnight
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayStart);

  // this month start
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // last month range
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // chart: last 30 days
  const last30 = new Date(now);
  last30.setDate(last30.getDate() - 30);

  const completedStatuses = [
    { status: { $regex: "Delivered", $options: "i" } },
    { status: { $regex: "POS-Completed", $options: "i" } },
  ];

  try {
    const [totalAmountRes, thisMonthRes, lastMonthRes, todayOrders, yesterdayOrders, chartOrders] =
      await Promise.all([
        // all-time total
        Order.aggregate([{ $group: { _id: null, tAmount: { $sum: "$total" } } }]),

        // this month completed
        Order.aggregate([
          { $match: { $or: completedStatuses, updatedAt: { $gte: thisMonthStart } } },
          { $group: { _id: null, total: { $sum: "$total" }, ownerProfit: { $sum: "$ownerProfit" }, referralCommission: { $sum: "$referralCommission" } } },
        ]),

        // last month completed
        Order.aggregate([
          { $match: { $or: completedStatuses, updatedAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),

        // today all orders (any status) for payment breakdown
        Order.find(
          { updatedAt: { $gte: todayStart } },
          { paymentMethod: 1, total: 1, updatedAt: 1, createdAt: 1, ownerProfit: 1 }
        ),

        // yesterday all orders
        Order.find(
          { updatedAt: { $gte: yesterdayStart, $lt: yesterdayEnd } },
          { paymentMethod: 1, total: 1, updatedAt: 1, createdAt: 1 }
        ),

        // last 30 days for chart (completed only)
        Order.find(
          { $or: completedStatuses, updatedAt: { $gte: last30 } },
          { paymentMethod: 1, total: 1, updatedAt: 1, createdAt: 1 }
        ),
      ]);

    const todayOwnerProfit = todayOrders.reduce((s, o) => s + (o.ownerProfit || 0), 0);

    res.send({
      totalAmount: totalAmountRes[0] ? parseFloat(totalAmountRes[0].tAmount).toFixed(2) : 0,
      thisMonthlyOrderAmount: thisMonthRes[0]?.total || 0,
      lastMonthOrderAmount: lastMonthRes[0]?.total || 0,
      thisMonthOwnerProfit: thisMonthRes[0]?.ownerProfit || 0,
      thisMonthReferralCommission: thisMonthRes[0]?.referralCommission || 0,
      todayOwnerProfit: parseFloat(todayOwnerProfit.toFixed(2)),
      // ordersData contains today + yesterday + chart data
      ordersData: [...todayOrders, ...yesterdayOrders, ...chartOrders],
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getBestSellerProductChart = async (req, res) => {
  try {
    const totalDoc = await Order.countDocuments({});
    const bestSellingProduct = await Order.aggregate([
      { $unwind: "$cart" },
      {
        $addFields: {
          cleanTitle: {
            $trim: {
              input: {
                $arrayElemAt: [
                  { $split: [
                    { $cond: [
                      { $eq: [{ $type: "$cart.title" }, "string"] },
                      "$cart.title",
                      { $ifNull: ["$cart.title.en", "Unknown"] }
                    ]},
                    "("
                  ]},
                  0
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$cleanTitle",
          count: { $sum: "$cart.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    res.send({ totalDoc, bestSellingProduct });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getDashboardOrders = async (req, res) => {
  const { page, limit } = req.query;

  const pages = Number(page) || 1;
  const limits = Number(limit) || 8;
  const skip = (pages - 1) * limits;

  let week = new Date();
  week.setDate(week.getDate() - 10);

  const start = new Date().toDateString();

  // (startDate = '12:00'),
  //   (endDate = '23:59'),
  // console.log("page, limit", page, limit);

  try {
    const totalDoc = await Order.countDocuments({});

    // query for orders
    const orders = await Order.find({})
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limits);

    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          tAmount: {
            $sum: "$total",
          },
        },
      },
    ]);

    // total order amount
    const todayOrder = await Order.find({ createdAt: { $gte: start } });

    // this month order amount
    const totalAmountOfThisMonth = await Order.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          total: {
            $sum: "$total",
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    // total padding order count
    const totalPendingOrder = await Order.aggregate([
      {
        $match: {
          status: "Pending",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalProcessingOrder = await Order.aggregate([
      {
        $match: {
          status: "Processing",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // total delivered order count
    const totalDeliveredOrder = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    //weekly sale report
    // filter order data
    const weeklySaleReport = await Order.find({
      $or: [{ status: { $regex: `Delivered`, $options: "i" } }],
      createdAt: {
        $gte: week,
      },
    });

    res.send({
      totalOrder: totalDoc,
      totalAmount:
        totalAmount.length === 0
          ? 0
          : parseFloat(totalAmount[0].tAmount).toFixed(2),
      todayOrder: todayOrder,
      totalAmountOfThisMonth:
        totalAmountOfThisMonth.length === 0
          ? 0
          : parseFloat(totalAmountOfThisMonth[0].total).toFixed(2),
      totalPendingOrder:
        totalPendingOrder.length === 0 ? 0 : totalPendingOrder[0],
      totalProcessingOrder:
        totalProcessingOrder.length === 0 ? 0 : totalProcessingOrder[0].count,
      totalDeliveredOrder:
        totalDeliveredOrder.length === 0 ? 0 : totalDeliveredOrder[0].count,
      orders,
      weeklySaleReport,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const addPosOrder = async (req, res) => {
  try {
    // resolve registered customer (by id or email, skip walk-in email)
    let customer = null;
    if (req.body.customerId) {
      customer = await Customer.findById(req.body.customerId);
    } else if (
      req.body.user_info?.email &&
      req.body.user_info.email !== "pos@n23gujaratibasket.com"
    ) {
      customer = await Customer.findOne({ email: req.body.user_info.email });
    }

    const newOrder = new Order({
      cart: req.body.cart || [],
      subTotal: Number(req.body.subTotal) || 0,
      shippingCost: Number(req.body.shippingCost) || 0,
      discount: Number(req.body.discount) || 0,
      total: Number(req.body.total) || 0,
      paymentMethod: req.body.paymentMethod || "Cash",
      user_info: req.body.user_info || {},
      status: "POS-Completed",
      orderSource: "POS",
      createdBy:
        typeof req.body.createdBy === "object"
          ? req.body.createdBy?.en || JSON.stringify(req.body.createdBy)
          : req.body.createdBy || "Admin",
      ...(customer && { user: customer._id }),
    });

    const order = await newOrder.save();

    // calculate profit and split
    const totalProfit = await calculateOrderProfit(order.cart);
    const tp = parseFloat(totalProfit.toFixed(2));

    let profitUpdate;

    if (customer && customer.referredBy) {
      // registered customer WITH referrer — 60/40 split
      const referralCommission = parseFloat((tp * 0.4).toFixed(2));
      const ownerProfit = parseFloat((tp * 0.6).toFixed(2));

      // credit referrer wallet
      await Customer.findByIdAndUpdate(
        customer.referredBy,
        { $inc: { walletBalance: referralCommission } }
      );

      const Transaction = require("../models/Transaction");
      await new Transaction({
        user: customer.referredBy,
        type: "referral_commission",
        amount: referralCommission,
        order: order._id,
        description: `Referral commission from POS order #${order.invoice} by ${customer.name}`,
        status: "completed",
      }).save();

      profitUpdate = {
        totalProfit: tp,
        ownerProfit,
        referralCommission,
        referrer: customer.referredBy,
      };
    } else {
      // walk-in OR registered customer with NO referrer — owner gets 100%
      profitUpdate = {
        totalProfit: tp,
        ownerProfit: tp,
        referralCommission: 0,
      };
    }

    await Order.findByIdAndUpdate(order._id, { $set: profitUpdate });

    res.status(201).send(order);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  getOrderCustomer,
  updateOrder,
  deleteOrder,
  getBestSellerProductChart,
  getDashboardOrders,
  getDashboardRecentOrder,
  getDashboardCount,
  getDashboardAmount,
  addPosOrder,
};
