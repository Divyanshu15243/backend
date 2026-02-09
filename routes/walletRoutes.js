const express = require("express");
const router = express.Router();
const { getWalletDetails, getTransactions } = require("../controller/walletController");
const { isAuth } = require("../config/auth");

router.get("/wallet", isAuth, getWalletDetails);
router.get("/transactions", isAuth, getTransactions);

module.exports = router;
