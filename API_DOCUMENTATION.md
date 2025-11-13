# Smart Bin Backend API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Most endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your-token}
```

---

## 📱 Authentication Endpoints

### Register

**POST** `/auth/register`

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone_number": "081234567890",
    "pin": "1234"
}
```

**Response:**

```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone_number": "081234567890",
            "total_points": 0
        },
        "token": "1|abc123..."
    }
}
```

### Login

**POST** `/auth/login`

**Request Body:**

```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

### Logout

**POST** `/auth/logout` 🔒

### Forgot Password

**POST** `/auth/forgot-password`

### Reset Password

**POST** `/auth/reset-password`

---

## 👤 User Profile Endpoints

### Get Profile

**GET** `/user/profile` 🔒

### Update Profile

**PUT** `/user/profile` 🔒

**Request Body:**

```json
{
    "name": "John Updated",
    "phone_number": "081234567891"
}
```

### Change PIN

**PUT** `/user/change-pin` 🔒

**Request Body:**

```json
{
    "current_pin": "1234",
    "new_pin": "5678"
}
```

### Change Password

**PUT** `/user/change-password` 🔒

**Request Body:**

```json
{
    "current_password": "oldpassword",
    "new_password": "newpassword",
    "new_password_confirmation": "newpassword"
}
```

### Validate PIN

**POST** `/user/validate-pin` 🔒

**Request Body:**

```json
{
    "pin": "1234"
}
```

---

## 🗑️ Smart Bin Endpoints

### Get All Smart Bins

**GET** `/smart-bins`

**Query Parameters:**

-   `status` - Filter by status (online, offline, full, maintenance)
-   `search` - Search by name or location
-   `latitude` & `longitude` - Get nearby bins
-   `radius` - Radius in km (default: 10)

**Example:**

```
GET /smart-bins?status=online&latitude=-6.2088&longitude=106.8456&radius=5
```

### Get Smart Bin Details

**GET** `/smart-bins/{id}`

### Update Smart Bin Status

**PUT** `/smart-bins/{id}/status`

**Request Body:**

```json
{
    "status": "online",
    "capacity_percentage": 45
}
```

### Validate User PIN (for Smart Bin)

**POST** `/smart-bins/validate-pin`

**Request Body:**

```json
{
    "pin": "1234",
    "smart_bin_id": 1
}
```

**Response:**

```json
{
    "success": true,
    "message": "PIN validated successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "total_points": 500
        },
        "smart_bin": {
            "id": 1,
            "name": "Smart Bin - Mall ABC",
            "location": "Jl. Sudirman No. 123, Jakarta"
        }
    }
}
```

### Smart Bin Heartbeat

**POST** `/smart-bins/{id}/heartbeat`

---

## 💰 Transaction Endpoints

### Get Transaction History

**GET** `/transactions` 🔒

**Query Parameters:**

-   `per_page` - Items per page (default: 15)
-   `type` - Filter by type (deposit, redeem)

### Get Point History

**GET** `/transactions/points` 🔒

### Get Total Points

**GET** `/transactions/total-points` 🔒

### Get Transaction Details

**GET** `/transactions/{id}` 🔒

### Create Deposit Transaction (by Smart Bin)

**POST** `/transactions/deposit`

**Request Body:**

```json
{
    "user_id": 1,
    "smart_bin_id": 1,
    "bottles_count": 5,
    "points_per_bottle": 10
}
```

**Response:**

```json
{
    "success": true,
    "message": "Deposit successful",
    "data": {
        "transaction": {
            "id": 1,
            "user_id": 1,
            "smart_bin_id": 1,
            "type": "deposit",
            "points": 50,
            "bottles_count": 5
        },
        "user": {
            "id": 1,
            "name": "John Doe",
            "total_points": 550,
            "points_earned": 50
        }
    }
}
```

---

## 🎁 Redeem Endpoints

### Get E-Wallet Options

**GET** `/redeem/options` 🔒

**Response:**

```json
{
    "success": true,
    "data": {
        "options": [
            {
                "type": "gopay",
                "name": "GoPay",
                "icon": "gopay.png",
                "minimum_points": 100
            }
        ],
        "conversion_rate": 10,
        "minimum_points": 100,
        "note": "1 point = Rp 10"
    }
}
```

### Get Redeem Packages

**GET** `/redeem/packages` 🔒

### Calculate Redeem

**POST** `/redeem/calculate` 🔒

**Request Body:**

```json
{
    "points": 500
}
```

### Redeem Points

**POST** `/redeem` 🔒

**Request Body:**

```json
{
    "points": 500,
    "ewallet_type": "gopay",
    "ewallet_account": "081234567890"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Redeem successful. Payment will be processed shortly.",
    "data": {
        "transaction": {
            "id": 2,
            "user_id": 1,
            "type": "redeem",
            "points": -500,
            "ewallet_type": "gopay",
            "ewallet_account": "081234567890",
            "ewallet_amount": 5000,
            "status": "completed"
        },
        "user": {
            "id": 1,
            "name": "John Doe",
            "total_points": 0
        }
    }
}
```

### Get Redeem History

**GET** `/redeem/history` 🔒

---

## 🔴 Real-time Events (Broadcasting)

### User Points Updated

**Channel:** `user.{user_id}` (Private)

**Event:** `PointsUpdated`

**Payload:**

```json
{
    "user_id": 1,
    "total_points": 550,
    "points_change": 50,
    "transaction_type": "deposit",
    "description": "Deposited 5 bottle(s)",
    "timestamp": "2025-11-13T10:30:00Z"
}
```

### Smart Bin Status Updated

**Channel:** `smart-bins` (Public)

**Event:** `SmartBinStatusUpdated`

**Payload:**

```json
{
    "bin_id": 1,
    "bin_code": "SB001",
    "name": "Smart Bin - Mall ABC",
    "status": "online",
    "capacity_percentage": 45,
    "total_bottles_collected": 200,
    "last_online_at": "2025-11-13T10:30:00Z",
    "timestamp": "2025-11-13T10:30:00Z"
}
```

---

## 📊 Database Schema

### Users Table

-   id
-   name
-   email (unique)
-   password (hashed)
-   phone_number (unique)
-   pin (hashed)
-   total_points (default: 0)
-   timestamps

### Smart Bins Table

-   id
-   bin_code (unique)
-   name
-   location
-   latitude, longitude
-   status (online, offline, full, maintenance)
-   capacity_percentage (0-100)
-   total_bottles_collected
-   last_online_at
-   timestamps

### Transactions Table

-   id
-   user_id (foreign key)
-   smart_bin_id (foreign key, nullable)
-   type (deposit, redeem)
-   points (positive/negative)
-   bottles_count (for deposits)
-   ewallet_type, ewallet_account, ewallet_amount (for redeems)
-   status (pending, completed, failed)
-   notes
-   timestamps

### Point Transactions Table

-   id
-   user_id (foreign key)
-   transaction_id (foreign key)
-   points_before
-   points_change
-   points_after
-   description
-   timestamps

---

## 🚀 Getting Started

1. Install dependencies:

```bash
composer install
```

2. Setup environment:

```bash
cp .env.example .env
php artisan key:generate
```

3. Run migrations:

```bash
php artisan migrate
```

4. Seed database:

```bash
php artisan db:seed
```

5. Start server:

```bash
php artisan serve
```

## 🧪 Test Accounts

**User 1:**

-   Email: test@example.com
-   Password: password
-   PIN: 1234
-   Points: 500

**User 2:**

-   Email: john@example.com
-   Password: password
-   PIN: 5678
-   Points: 1200

---

## 📝 Notes

-   All API responses follow a consistent format with `success`, `message`, and `data` fields
-   Timestamps are in UTC
-   Points conversion: 1 point = Rp 10
-   Default points per bottle: 10 points
-   Minimum redeem: 100 points

🔒 = Requires authentication
