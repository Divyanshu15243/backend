require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { connectDB } = require("../config/db");
const productRoutes = require("../routes/productRoutes");
const customerRoutes = require("../routes/customerRoutes");
const { addShippingAddress } = require("../controller/customerController");
const adminRoutes = require("../routes/adminRoutes");
const orderRoutes = require("../routes/orderRoutes");
const customerOrderRoutes = require("../routes/customerOrderRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const couponRoutes = require("../routes/couponRoutes");
const attributeRoutes = require("../routes/attributeRoutes");
const settingRoutes = require("../routes/settingRoutes");
const currencyRoutes = require("../routes/currencyRoutes");
const languageRoutes = require("../routes/languageRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const walletRoutes = require("../routes/walletRoutes");
const { isAuth } = require("../config/auth");

connectDB();
const app = express();

app.set("trust proxy", 1);
app.use(express.json({ limit: "4mb" }));
app.use(helmet());

// CORS — explicit origins with credentials support
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4100",
  "https://admin.n23gujaratibasket.com",
  "https://www.n23gujaratibasket.com",
  "https://n23gujaratibasket.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow no-origin requests (Postman, mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// root
app.get("/", (req, res) => {
  res.send("App works properly!");
});

app.post("/api/customer/shipping/address/:id", addShippingAddress);

// store + admin routes
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/order", isAuth, customerOrderRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/currency", isAuth, currencyRoutes);
app.use("/api/language", languageRoutes);
app.use("/api/notification", isAuth, notificationRoutes);
app.use("/api/customer/wallet", walletRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);

// error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
