const Customer = require("../../models/Customer");
const Transaction = require("../../models/Transaction");
const Product = require("../../models/Product");

// Calculate total profit from cart items
const calculateOrderProfit = async (cart) => {
  let totalProfit = 0;

  for (const item of cart) {
    let profit = 0;

    // item._id is the Mongoose subdocument auto-id — NOT the product id
    // product id is stored in item.productId (set at checkout) or item.id (react-use-cart)
    const productId = item.productId || item.id;

    if (productId) {
      try {
        const product = await Product.findById(productId).select("prices variants isCombination");
        if (product) {
          if (product.isCombination && product.variants?.length > 0) {
            // match variant by its productId field first
            let matchedVariant = product.variants.find(
              (v) => v.productId && String(v.productId) === String(item.variant?.productId)
            );
            // fallback: match by sale price
            if (!matchedVariant) {
              matchedVariant = product.variants.find(
                (v) => parseFloat(v.price) === parseFloat(item.price)
              );
            }
            profit = parseFloat(matchedVariant?.profit || product.prices?.profit || 0);
          } else {
            profit = parseFloat(product.prices?.profit || 0);
          }
        }
      } catch (_) {
        profit = 0;
      }
    }

    // fallback to cart-embedded profit only if DB returned 0
    if (profit === 0) {
      if (item.variant?.profit && parseFloat(item.variant.profit) > 0) {
        profit = parseFloat(item.variant.profit);
      } else if (item.prices?.profit && parseFloat(item.prices.profit) > 0) {
        profit = parseFloat(item.prices.profit);
      }
    }

    totalProfit += profit * (item.quantity || 1);
  }

  return totalProfit;
};

const processReferralCommission = async (order, userId) => {
  try {
    const totalProfit = await calculateOrderProfit(order.cart);

    const customer = await Customer.findById(userId);

    if (!customer) return null;

    if (!customer.referredBy) {
      // No referrer — owner keeps 100% of profit
      return {
        totalProfit,
        referralCommission: 0,
        ownerProfit: parseFloat(totalProfit.toFixed(2)),
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
