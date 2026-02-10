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
} = require("../controller/customerController");
const {
  passwordVerificationLimit,
  emailVerificationLimit,
  phoneVerificationLimit,
} = require("../lib/email-sender/sender");

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
