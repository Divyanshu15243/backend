const Customer = require("../../models/Customer");
const Transaction = require("../../models/Transaction");
const Product = require("../../models/Product");

// Calculate total profit from cart items
const calculateOrderProfit = async (cart) => {
  let totalProfit = 0;

  for (const item of cart) {
    let profit = item.prices?.profit || item.variant?.profit || 0;

    if (!profit && item._id) {
      const product = await Product.findById(item._id).select("prices");
      profit = product?.prices?.profit || 0;
    }

    totalProfit += parseFloat(profit) * item.quantity;
  }

  return totalProfit;
};

const processReferralCommission = async (order, userId) => {
  try {
    const totalProfit = await calculateOrderProfit(order.cart);

    const customer = await Customer.findById(userId);

    if (!customer) return null;

    if (!customer.referredBy) {
      return {
        totalProfit,
        referralCommission: 0,
        ownerProfit: totalProfit,
        referrerId: null,
      };
    }

    const referralCommission = parseFloat((totalProfit * 0.4).toFixed(2));
    const ownerProfit = parseFloat((totalProfit * 0.6).toFixed(2));

    await Customer.findByIdAndUpdate(
      customer.referredBy,
      { $inc: { walletBalance: referralCommission } },
      { new: true }
    );

    const transaction = new Transaction({
      user: customer.referredBy,
      type: "referral_commission",
      amount: referralCommission,
      order: order._id,
      description: `Referral commission from order #${order.invoice} by ${customer.name}`,
      status: "completed",
    });
    await transaction.save();

    return {
      totalProfit,
      referralCommission,
      ownerProfit,
      referrerId: customer.referredBy,
    };
  } catch (error) {
    return null;
  }
};

module.exports = {
  calculateOrderProfit,
  processReferralCommission,
};
