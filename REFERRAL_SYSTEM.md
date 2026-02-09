# Referral Profit-Sharing System

## Overview
When a new user joins using a referral code and makes a purchase, the profit from products is split:
- **60%** goes to the owner
- **40%** goes to the referrer's wallet

## Implementation

### 1. Database Models

#### Transaction Model (`models/Transaction.js`)
- Tracks wallet transactions
- Records referral commissions
- Links to orders and users

#### Updated Order Model (`models/Order.js`)
- `totalProfit`: Total profit from the order
- `referralCommission`: Amount credited to referrer
- `referrer`: Reference to the referrer customer

#### Customer Model (Already exists)
- `walletBalance`: Current wallet balance
- `referredBy`: Reference to referrer
- `referralCode`: Unique referral code

### 2. Commission Processing

#### Commission Helper (`lib/referral/commissionHelper.js`)
- `calculateOrderProfit()`: Calculates total profit from cart items
- `processReferralCommission()`: Splits profit 60/40 and updates wallet

### 3. API Endpoints

#### Wallet Endpoints
- `GET /api/customer/wallet/wallet` - Get wallet balance and recent transactions
- `GET /api/customer/wallet/transactions` - Get paginated transaction history

### 4. Order Flow

When an order is created:
1. Order is saved to database
2. System checks if customer was referred
3. Calculates total profit from products
4. Splits profit: 40% to referrer, 60% to owner
5. Updates referrer's wallet balance
6. Creates transaction record

## Usage

### Backend
The system automatically processes commissions when orders are created via:
- `addOrder()` - Regular orders
- `addRazorpayOrder()` - Razorpay orders

### Frontend Integration
Add these API calls to your store:

```javascript
// Get wallet details
const getWallet = async () => {
  const response = await axios.get('/api/customer/wallet/wallet');
  return response.data;
};

// Get transactions
const getTransactions = async (page = 1, limit = 10) => {
  const response = await axios.get(`/api/customer/wallet/transactions?page=${page}&limit=${limit}`);
  return response.data;
};
```

## Notes
- Products must have a `profit` value in `prices.profit` field
- Commission is only processed for referred customers
- All transactions are logged for transparency
