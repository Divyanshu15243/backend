const express = require("express");
const router = express.Router();
const {
  loginCustomer,
  registerCustomer,
  verifyPhoneNumber,
  signUpWithProvider,
  signUpWithOauthProvider,
  verifyEmailAddress,
  forgetPassword,
  changePassword,
  resetPassword,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addAllCustomers,
  addShippingAddress,
  getShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  validateReferral,
  setReferredBy,
  otpLogin,
} = require("../controller/customerController");
const {
  passwordVerificationLimit,
  emailVerificationLimit,
  phoneVerificationLimit,
} = require("../lib/email-sender/sender");

// check if phone or email already registered
router.post("/check-exists", async (req, res) => {
  try {
    const { phone, email } = req.body;
    const Customer = require("../models/Customer");
    const phoneExists = phone ? await Customer.findOne({ phone }) : null;
    const emailExists = email ? await Customer.findOne({ email }) : null;
    res.send({
      phoneExists: !!phoneExists,
      emailExists: !!emailExists,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//verify email
router.post("/verify-email", emailVerificationLimit, verifyEmailAddress);

//validate referral code
router.post("/validate-referral", validateReferral);

//send payment notification
router.post("/payment-notification/:id", async (req, res) => {
  try {
    const customer = await require("../models/Customer").findById(req.params.id);
    if (!customer) return res.status(404).send({ message: "Customer not found" });
    
    const { sendEmail } = require("../lib/email-sender/sender");
    const body = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: "Payment Notification - Kachabazar",
      html: `<p>Dear ${customer.name},</p><p>Your referral commission amount of ₹${req.body.amount} has been credited to your account within 2 days.</p><p>Thank you for being a valued customer!</p>`,
    };
    sendEmail(body, res, "Payment notification sent successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// send NEFT payment notification
router.post("/neft-notification/:id", async (req, res) => {
  try {
    const Customer = require("../models/Customer");
    const { sendEmail } = require("../lib/email-sender/sender");
    const neftPaymentEmailBody = require("../lib/email-sender/templates/neft-payment");

    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send({ message: "Customer not found" });
    if (!customer.email) return res.status(400).send({ message: "Customer has no email address" });

    const { amount, neftNumber } = req.body;
    if (!neftNumber) return res.status(400).send({ message: "NEFT number is required" });

    const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    const body = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: `Payment of ₹${parseFloat(amount).toFixed(2)} Credited - N23 Gujarati Basket`,
      html: neftPaymentEmailBody({ name: customer.name, amount, neftNumber, date }),
    };

    // reset wallet after payment
    await Customer.findByIdAndUpdate(req.params.id, { walletBalance: 0 });

    sendEmail(body, res, "NEFT notification sent and wallet reset successfully");
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//verify phone number
router.post("/verify-phone", phoneVerificationLimit, verifyPhoneNumber);

// shipping address send to array
router.post("/shipping/address/:id", addShippingAddress);

// get all shipping address
router.get("/shipping/address/:id", getShippingAddress);

// shipping address update
router.put("/shipping/address/:userId/:shippingId", updateShippingAddress);

// shipping address delete
router.delete("/shipping/address/:userId/:shippingId", deleteShippingAddress);

//register a user
router.post("/register/:token", registerCustomer);

//login a user
router.post("/login", loginCustomer);

// otp login/signup
router.post("/otp-login", otpLogin);

//register or login with google and fb
router.post("/signup/oauth", signUpWithOauthProvider);

//register or login with google and fb
router.post("/signup/:token", signUpWithProvider);

//forget-password
router.put("/forget-password", passwordVerificationLimit, forgetPassword);

//reset-password
router.put("/reset-password", resetPassword);

//change password
router.post("/change-password", changePassword);

//add all users
router.post("/add/all", addAllCustomers);

//get all user
router.get("/", getAllCustomers);

//get a user
router.get("/:id", getCustomerById);

//update a user
router.put("/:id", updateCustomer);

//delete a user
router.delete("/:id", deleteCustomer);

module.exports = router;
