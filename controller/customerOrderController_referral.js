const getReferralEarnings = async (req, res) => {
  try {
    // Get all orders where current user is the referrer
    const orders = await Order.find({
      referrer: req.user._id,
    })
      .select("_id invoice user_info cart total referralCommission createdAt")
      .sort({ createdAt: -1 });

    // Calculate total earnings
    const totalEarnings = orders.reduce(
      (sum, order) => sum + (order.referralCommission || 0),
      0
    );

    res.send({
      orders,
      totalEarnings,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrderCustomer,
  getReferralEarnings,
  createPaymentIntent,
  createOrderByRazorPay,
  addRazorpayOrder,
  sendEmailInvoiceToCustomer,
};
