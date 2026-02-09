# Admin Referral Earnings Guide

## API Endpoints for Admin

### 1. Get All Users with Referral Earnings
**Endpoint:** `GET /api/admin/referral/earnings`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, email, or referral code

**Example:**
```bash
GET /api/admin/referral/earnings?page=1&limit=20&search=john
```

**Response:**
```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "referralCode": "ABC12345",
      "walletBalance": 240.50,
      "totalCommission": 240.50,
      "totalOrders": 10,
      "referredUsers": 5
    }
  ],
  "totalDoc": 50,
  "page": 1,
  "limit": 20
}
```

**What it shows:**
- `walletBalance`: Current wallet balance
- `totalCommission`: Total earnings from referrals
- `totalOrders`: Number of orders that generated commission
- `referredUsers`: Number of people they referred

---

### 2. Get Detailed Earnings for Specific User
**Endpoint:** `GET /api/admin/referral/user/:id`

**Example:**
```bash
GET /api/admin/referral/user/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "referralCode": "ABC12345",
    "walletBalance": 240.50
  },
  "transactions": [
    {
      "_id": "transaction_id",
      "amount": 24.00,
      "order": {
        "invoice": 10001,
        "total": 160,
        "createdAt": "2024-01-15"
      },
      "description": "Referral commission from order #10001",
      "createdAt": "2024-01-15"
    }
  ],
  "referredUsers": [
    {
      "_id": "referred_user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "createdAt": "2024-01-10"
    }
  ],
  "ordersWithCommission": [
    {
      "_id": "order_id",
      "invoice": 10001,
      "total": 160,
      "totalProfit": 60,
      "referralCommission": 24,
      "user": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-15"
    }
  ],
  "summary": {
    "totalEarnings": 240.50,
    "totalTransactions": 10,
    "totalReferredUsers": 5,
    "totalOrders": 10
  }
}
```

**What it shows:**
- Complete transaction history
- List of users they referred
- All orders that generated commission
- Summary statistics

---

### 3. Get Overall Referral Statistics
**Endpoint:** `GET /api/admin/referral/stats`

**Example:**
```bash
GET /api/admin/referral/stats
```

**Response:**
```json
{
  "totalCommissionsPaid": 5420.75,
  "totalTransactions": 234,
  "totalReferrers": 45,
  "totalReferredUsers": 120,
  "ordersWithReferral": 234,
  "profitBreakdown": {
    "totalProfit": 13551.88,
    "totalCommission": 5420.75,
    "ownerProfit": 8131.13
  }
}
```

**What it shows:**
- Total commissions paid to all referrers
- Number of active referrers
- Total referred users
- Profit breakdown (40% vs 60%)

---

## How to Use in Admin Panel

### Option 1: Using Postman/API Client

1. Login as admin to get token
2. Add header: `Authorization: Bearer YOUR_ADMIN_TOKEN`
3. Call the endpoints above

### Option 2: Create Admin Page (Frontend)

Create a new page in admin panel:
- `/admin/referrals` - List all users with earnings
- `/admin/referrals/:id` - View detailed earnings for one user
- `/admin/dashboard` - Add referral stats widget

### Example Frontend Code:

```javascript
// services/ReferralServices.js
const getReferralEarnings = async (page = 1, limit = 20, search = "") => {
  return await axios.get(`/api/admin/referral/earnings`, {
    params: { page, limit, search }
  });
};

const getUserReferralDetails = async (userId) => {
  return await axios.get(`/api/admin/referral/user/${userId}`);
};

const getReferralStats = async () => {
  return await axios.get(`/api/admin/referral/stats`);
};
```

---

## Quick View in Database

You can also check directly in MongoDB:

```javascript
// See all users with wallet balance
db.customers.find({ walletBalance: { $gt: 0 } })
  .sort({ walletBalance: -1 })

// See all referral transactions
db.transactions.find({ type: "referral_commission" })

// See orders with commission
db.orders.find({ referralCommission: { $gt: 0 } })
```

---

## Understanding the Numbers

**Example:**
- Product profit: $60
- Referral commission (40%): $24 → Goes to referrer's wallet
- Owner profit (60%): $36 → Your profit

**In the admin panel you'll see:**
- User's `walletBalance`: $24
- Order's `totalProfit`: $60
- Order's `referralCommission`: $24
- Your actual profit: $36 (calculated as totalProfit - referralCommission)
