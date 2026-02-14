const Customer = require("../../models/Customer");
const Transaction = require("../../models/Transaction");
const Product = require("../../models/Product");

// Calculate total profit from cart items
const calculateOrderProfit = async (cart) => {
  let totalProfit = 0;

  for (const item of cart) {
    const profit = item.prices?.profit || item.variant?.profit || 0;
    totalProfit += parseFloat(profit) * item.quantity;
  }

  return totalProfit;
};

// Process referral commission (40% of profit to referrer, 60% to owner)
const processReferralCommission = async (order, userId) => {
  try {
    const totalProfit = await calculateOrderProfit(order.cart);
    
    if (totalProfit <= 0) {
      return null;
    }

    const customer = await Customer.findById(userId);
    
    // If no referrer, owner gets 100% profit
    if (!customer || !customer.referredBy) {
      return {
        totalProfit,
        referralCommission: 0,
        ownerProfit: totalProfit,
        referrerId: null,
      };
    }

    const referralCommission = totalProfit * 0.4; // 40% to referrer
    const ownerProfit = totalProfit * 0.6; // 60% to owner

    // Update referrer's wallet
    await Customer.findByIdAndUpdate(customer.referredBy, {
      $inc: { walletBalance: referralCommission },
    });

    // Create transaction record
    const transaction = new Transaction({
      user: customer.referredBy,
      type: "referral_commission",
      amount: referralCommission,
      order: order._id,
      description: `Referral commission from order #${order.invoice}`,
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
    console.error("Error processing referral commission:", error);
    return null;
  }
};

module.exports = {
  calculateOrderProfit,
  processReferralCommission,
};
