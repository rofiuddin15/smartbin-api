# 🚀 Quick Start Guide

## Setup Backend (5 menit)

### 1. Install Dependencies

```bash
composer install
```

### 2. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

### 3. Run Migrations & Seed

```bash
php artisan migrate:fresh --seed
```

### 4. Start Server

```bash
php artisan serve
```

Server berjalan di: `http://127.0.0.1:8000`

---

## Testing API dengan cURL

### 1. Health Check

```bash
curl http://127.0.0.1:8000/api/health
```

**Response:**

```json
{
    "status": "ok",
    "timestamp": "2025-11-13T...",
    "service": "Smart Bin API"
}
```

### 2. Login

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Response:**

```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "name": "Test User",
            "total_points": 500
        },
        "token": "1|xxxxxxxxxxxxx"
    }
}
```

**💡 Simpan token untuk request berikutnya!**

### 3. Get Smart Bins

```bash
curl http://127.0.0.1:8000/api/v1/smart-bins
```

### 4. Get Profile (butuh token)

```bash
curl http://127.0.0.1:8000/api/v1/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Deposit Botol (Simulasi Smart Bin)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "smart_bin_id": 1,
    "bottles_count": 5,
    "points_per_bottle": 10
  }'
```

**Response:**

```json
{
    "success": true,
    "message": "Deposit successful",
    "data": {
        "user": {
            "id": 1,
            "name": "Test User",
            "total_points": 550,
            "points_earned": 50
        }
    }
}
```

### 6. Redeem Poin (butuh token)

```bash
curl -X POST http://127.0.0.1:8000/api/v1/redeem \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "points": 100,
    "ewallet_type": "gopay",
    "ewallet_account": "081234567890"
  }'
```

---

## Testing dengan Postman

### 1. Import Collection

1. Buka Postman
2. Import file: `SmartBin_API.postman_collection.json`
3. Collection "Smart Bin API" akan muncul

### 2. Setup Environment

1. Klik Collections → Smart Bin API
2. Tab "Variables"
3. `base_url` sudah set ke `http://127.0.0.1:8000/api/v1`
4. Kosongkan `token` (akan diisi otomatis setelah login)

### 3. Test Login

1. Buka folder "Authentication"
2. Klik request "Login"
3. Klik "Send"
4. Copy token dari response
5. Paste ke variable `token`

### 4. Test Endpoints

Sekarang bisa test semua endpoints yang butuh authentication!

---

## Test Accounts

### User 1

-   **Email:** test@example.com
-   **Password:** password
-   **PIN:** 1234
-   **Points:** 500

### User 2

-   **Email:** john@example.com
-   **Password:** password
-   **PIN:** 5678
-   **Points:** 1200

---

## Flow Testing Lengkap

### Scenario: User Deposit Botol & Redeem

#### 1. Login sebagai user

```bash
POST /api/v1/auth/login
```

#### 2. Cek poin awal

```bash
GET /api/v1/transactions/total-points
```

#### 3. Validasi PIN di Smart Bin

```bash
POST /api/v1/smart-bins/validate-pin
{
  "pin": "1234",
  "smart_bin_id": 1
}
```

#### 4. Deposit botol (dari Smart Bin)

```bash
POST /api/v1/transactions/deposit
{
  "user_id": 1,
  "smart_bin_id": 1,
  "bottles_count": 10,
  "points_per_bottle": 10
}
```

#### 5. Cek poin setelah deposit

```bash
GET /api/v1/transactions/total-points
```

#### 6. Lihat riwayat transaksi

```bash
GET /api/v1/transactions
```

#### 7. Lihat paket redeem

```bash
GET /api/v1/redeem/packages
```

#### 8. Hitung redeem

```bash
POST /api/v1/redeem/calculate
{
  "points": 100
}
```

#### 9. Redeem ke e-wallet

```bash
POST /api/v1/redeem
{
  "points": 100,
  "ewallet_type": "gopay",
  "ewallet_account": "081234567890"
}
```

#### 10. Cek poin akhir

```bash
GET /api/v1/transactions/total-points
```

---

## Common Issues & Solutions

### Issue: "Database not found"

**Solution:**

```bash
touch database/database.sqlite
php artisan migrate:fresh --seed
```

### Issue: "Token mismatch"

**Solution:**

```bash
php artisan key:generate
```

### Issue: "Route not found"

**Solution:** Pastikan API routes sudah di-load di `bootstrap/app.php`

### Issue: "Unauthenticated"

**Solution:**

-   Pastikan sudah login dan dapat token
-   Include header: `Authorization: Bearer {token}`

---

## Development Tips

### Clear Cache

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

### View Routes

```bash
php artisan route:list --path=api
```

### Tinker (Database CLI)

```bash
php artisan tinker

# Check users
>>> User::all();

# Check smart bins
>>> SmartBin::where('status', 'online')->get();

# Check user points
>>> User::find(1)->total_points;
```

### Fresh Database

```bash
php artisan migrate:fresh --seed
```

---

## Production Deployment

### 1. Update .env

```env
APP_ENV=production
APP_DEBUG=false
```

### 2. Optimize

```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 3. Setup Queue Worker

```bash
php artisan queue:work --daemon
```

### 4. Setup Scheduler (Crontab)

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Need Help?

📖 **Full Documentation:** See `API_DOCUMENTATION.md`  
⚙️ **Environment Setup:** See `ENVIRONMENT_SETUP.md`  
📊 **Project Summary:** See `SUMMARY.md`

---

Happy Coding! 🎉
