# 🗑️ Smart Bin Backend API

Backend API untuk ekosistem Smart Bin - sistem daur ulang botol cerdas dengan reward points yang dapat ditukar ke e-wallet.

## 📋 Deskripsi

Aplikasi backend ini adalah bagian dari ekosistem Smart Bin yang terdiri dari:

1. **Aplikasi Mobile (Android)** - Untuk pengguna mendaftar dan mengelola akun
2. **Smart Bin System** - Aplikasi di layar bin untuk autentikasi dan deposit
3. **Backend API** - Server untuk mengelola data dan komunikasi real-time

## ✨ Fitur Utama

### Autentikasi & Manajemen Pengguna

-   ✅ Registrasi pengguna dengan email, nama, nomor HP, dan PIN
-   ✅ Login/Logout menggunakan Laravel Sanctum
-   ✅ Reset password
-   ✅ Manajemen profil pengguna
-   ✅ Ganti PIN dan password
-   ✅ Validasi PIN untuk Smart Bin

### Smart Bin Management

-   ✅ Daftar lokasi Smart Bin dengan status (online/offline/full)
-   ✅ Pencarian bin berdasarkan lokasi (GPS)
-   ✅ Update status bin secara real-time
-   ✅ Heartbeat monitoring untuk bin
-   ✅ Validasi PIN pengguna di bin

### Sistem Poin & Transaksi

-   ✅ Deposit botol → tambah poin (10 poin/botol)
-   ✅ Riwayat transaksi lengkap
-   ✅ Point transaction log detail
-   ✅ Akumulasi poin per pengguna

### Redeem & E-Wallet

-   ✅ Tukar poin ke e-wallet (GoPay, OVO, DANA, ShopeePay)
-   ✅ Konversi rate: 1 poin = Rp 10
-   ✅ Minimum redeem: 100 poin
-   ✅ Paket redeem siap pakai
-   ✅ Riwayat penukaran

### Real-time Features

-   ✅ Broadcasting event untuk update poin
-   ✅ Broadcasting status Smart Bin
-   ✅ WebSocket ready untuk komunikasi real-time

## 🛠️ Tech Stack

-   **Framework:** Laravel 12
-   **PHP:** 8.2+
-   **Database:** SQLite (dev) / MySQL (production)
-   **Authentication:** Laravel Sanctum
-   **Broadcasting:** Laravel Echo (ready)
-   **API:** RESTful JSON API

## 📦 Instalasi

### Prerequisites

-   PHP 8.2 atau lebih tinggi
-   Composer
-   SQLite (atau MySQL/PostgreSQL untuk production)

### Langkah Instalasi

1. **Clone repository**

```bash
git clone <repository-url>
cd smartbin_backend
```

2. **Install dependencies**

```bash
composer install
```

3. **Setup environment**

```bash
cp .env.example .env
php artisan key:generate
```

4. **Run migrations**

```bash
php artisan migrate
```

5. **Seed database dengan data sample**

```bash
php artisan db:seed
```

6. **Start development server**

```bash
php artisan serve
```

API akan berjalan di `http://127.0.0.1:8000`

## 🧪 Testing

### Test Account

Setelah seeding, gunakan akun berikut untuk testing:

**User 1:**

-   Email: `test@example.com`
-   Password: `password`
-   PIN: `1234`
-   Points: 500

**User 2:**

-   Email: `john@example.com`
-   Password: `password`
-   PIN: `5678`
-   Points: 1200

### Sample Smart Bins

-   SB001 - Mall ABC (Online, 25% capacity)
-   SB002 - Universitas XYZ (Online, 60% capacity)
-   SB003 - Taman Kota (Online, 15% capacity)
-   SB004 - Kantor Pemerintah (Offline)
-   SB005 - Stasiun Kereta (Full, 95% capacity)

### Test dengan cURL

**Login:**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

**Get Smart Bins:**

```bash
curl -X GET http://127.0.0.1:8000/api/v1/smart-bins
```

### Postman Collection

Import file `SmartBin_API.postman_collection.json` ke Postman untuk testing lengkap.

## 📚 Dokumentasi API

Lihat dokumentasi lengkap di: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Base URL

```
http://127.0.0.1:8000/api/v1
```

### Endpoint Groups

-   `/auth/*` - Authentication
-   `/user/*` - User profile management
-   `/smart-bins/*` - Smart Bin operations
-   `/transactions/*` - Transaction history & deposits
-   `/redeem/*` - Points redemption

## 🗄️ Database Schema

### Tables

-   **users** - Data pengguna, poin, PIN
-   **smart_bins** - Data bin, lokasi, status
-   **transactions** - Transaksi deposit & redeem
-   **point_transactions** - Log detail perubahan poin
-   **personal_access_tokens** - API tokens (Sanctum)

### Relationships

```
User ─────< Transaction ─────< PointTransaction
             │
             └──── SmartBin
```

## 🔄 Real-time Events

### PointsUpdated

-   **Channel:** `user.{user_id}` (Private)
-   **Trigger:** Saat deposit atau redeem
-   **Data:** user_id, total_points, points_change, description

### SmartBinStatusUpdated

-   **Channel:** `smart-bins` (Public)
-   **Trigger:** Saat status bin berubah
-   **Data:** bin_id, status, capacity, location

## 🚀 Deployment

### Production Checklist

-   [ ] Ubah `APP_ENV=production` di .env
-   [ ] Set `APP_DEBUG=false`
-   [ ] Gunakan MySQL/PostgreSQL
-   [ ] Setup Redis untuk cache & queue
-   [ ] Configure proper CORS
-   [ ] Setup SSL/HTTPS
-   [ ] Configure broadcasting driver (Pusher/Socket.io)
-   [ ] Setup payment gateway integration
-   [ ] Configure email service
-   [ ] Setup backup database

## 🔐 Security

-   Semua password & PIN di-hash dengan bcrypt
-   API authentication menggunakan Laravel Sanctum
-   CSRF protection enabled
-   Rate limiting implemented
-   Input validation pada semua endpoint

## 🤝 Integrasi dengan Komponen Lain

### Mobile App (Android)

-   Konsumsi REST API untuk semua operasi
-   Subscribe ke WebSocket untuk real-time updates
-   Autentikasi menggunakan Bearer token

### Smart Bin System

-   Validasi PIN via API `/smart-bins/validate-pin`
-   Submit deposit via `/transactions/deposit`
-   Heartbeat monitoring via `/smart-bins/{id}/heartbeat`
-   Update status via `/smart-bins/{id}/status`

### Payment Gateway (Future)

-   Integrasi Midtrans/Xendit untuk redeem
-   Webhook untuk konfirmasi pembayaran

## 📝 License

MIT License

## 👥 Contact

Untuk pertanyaan atau support, silakan hubungi tim development.

---

**Built with ❤️ using Laravel**
