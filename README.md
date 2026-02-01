# KachaBazar Backend API

E-commerce backend with referral system, profit tracking, and multi-currency support.

## Features
- User authentication with JWT
- Referral code system (40% profit sharing)
- Product management with variants
- Profit tracking per product
- Order management
- Email notifications
- Cloudinary image upload
- Multi-currency support (₹ Rupee added)

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary
- Nodemailer

## Installation

1. Clone repository:
```bash
git clone https://github.com/YOUR_USERNAME/kachabazar-backend.git
cd kachabazar-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials

5. Start server:
```bash
npm start
```

## Environment Variables

See `.env.example` for required variables.

## API Endpoints

- `POST /api/customer/register` - Register user
- `POST /api/customer/login` - Login user
- `POST /api/customer/validate-referral` - Validate referral code
- `GET /api/products` - Get products
- `POST /api/orders` - Create order

## Default Admin Credentials

```
Email: admin@gmail.com
Password: 12345678
```

**⚠️ Change password after first login!**

## License

Private - All rights reserved
