const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    invoice: {
      type: Number,
      required: false,
    },
    cart: [{}],
    user_info: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      contact: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      zipCode: {
        type: String,
        required: false,
      },
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    referralCommission: {
      type: Number,
      default: 0,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    shippingOption: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Delivered", "Cancel"],
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', async function() {
  if (!this.invoice) {
    const lastOrder = await this.constructor.findOne({}, {}, { sort: { 'invoice': -1 } });
    this.invoice = lastOrder ? lastOrder.invoice + 1 : 10000;
  }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
