const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },

    shippingAddress: {
      type: Object,
      required: false,
      // name: {
      //   type: String,
      //   required: true,
      // },
      // contact: {
      //   type: String,
      //   required: true,
      // },
      // email: {
      //   type: String,
      //   required: true,
      //   unique: true,
      //   lowercase: true,
      // },

      // address: {
      //   type: String,
      //   required: true,
      // },
      // country: {
      //   type: String,
      //   required: true,
      // },
      // city: {
      //   type: String,
      //   required: true,
      // },
      // area: {
      //   type: String,
      //   required: true,
      // },
      // zipCode: {
      //   type: String,
      //   required: true,
      // },
      // isDefault: {
      //   type: Boolean,
      //   required: true,
      // },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },

    // 🔗 Referral system
    referralCode: {
      type: String,
      unique: true,
      index: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    // 💰 Wallet system
    walletBalance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
