# 🗑️ SmartBin Pamekasan - Ecosystem & Admin Dashboard

Sistem manajemen daur ulang botol cerdas berbasis IoT yang mengintegrasikan aplikasi mobile pengguna, perangkat penampung sampah pintar, dan dashboard administrasi real-time.

## 📋 Deskripsi Proyek

SmartBin Pamekasan adalah solusi teknologi untuk pengelolaan limbah anorganik (botol plastik) dengan mekanisme reward. Proyek ini merupakan sistem *hybrid* yang menggabungkan:
1. **Backend API (Laravel 12)**: Otak sistem yang mengelola basis data, logika bisnis, dan komunikasi IoT.
2. **Admin Dashboard (React + Vite)**: Panel kendali pusat untuk memonitor aset IoT, moderasi member, dan laporan keuangan.
3. **IoT Device System**: Perangkat keras yang diletakkan di lokasi publik untuk menerima setoran botol.
4. **Aplikasi Mobile**: Antarmuka pengguna untuk melihat poin, lokasi bin, dan penukaran saldo.

---

## ✨ Fitur Utama

### 🖥️ Dashboard Administrasi (Web)
- **Monitoring IoT Real-time**: Pantau status koneksi, kapasitas sampah, dan kesehatan baterai perangkat di peta interaktif.
- **Moderasi Member**: Sistem verifikasi pendaftaran pengguna mobile, persetujuan akun, dan manajemen blokir.
- **Manajemen Staff & RBAC**: Pengaturan hak akses berlapis (Role-Based Access Control) menggunakan Spatie.
- **Manajemen Payout**: Proses pencairan poin member ke berbagai e-wallet (GoPay, OVO, DANA) secara terkontrol.
- **Laporan Keuangan**: Visualisasi pendapatan dari hasil penjualan sampah vs pengeluaran pencairan poin.

### ⚙️ Backend API & IoT
- **Autentikasi Aman**: Menggunakan Laravel Sanctum untuk aplikasi mobile dan admin.
- **IoT Heartbeat**: Monitor konektivitas perangkat secara otomatis (Online/Offline).
- **Validasi PIN**: Keamanan ganda saat setor botol di perangkat fisik menggunakan enkripsi PIN.
- **Broadcasting Event**: Update poin dan status bin secara instan menggunakan Laravel Echo/Websocket.

---

## 🔄 Alur Kerja Sistem (Workflow)

### 1. Proses Setor Sampah (IoT to Backend)
1. **Autentikasi**: Pengguna memasukkan PIN di perangkat SmartBin.
2. **Validasi**: Perangkat mengirimkan PIN ke Backend API untuk verifikasi identitas.
3. **Setor**: Pengguna memasukkan botol, sensor mendeteksi jumlah, dan perangkat mengirimkan data setoran.
4. **Reward**: Backend menambahkan poin ke akun pengguna dan mengirimkan notifikasi real-time.

### 2. Proses Pencairan (User to Admin)
1. **Request**: Pengguna melakukan permintaan tukar poin ke saldo E-Money melalui aplikasi mobile.
2. **Moderasi**: Permintaan muncul di Dashboard Admin pada menu "Penukaran Poin".
3. **Eksekusi**: Admin memverifikasi data dan memproses transfer, kemudian menandai transaksi sebagai "Berhasil".

### 3. Monitoring Aset (IoT to Admin)
1. **Heartbeat**: Setiap 1-5 menit, perangkat SmartBin mengirimkan sinyal "hidup".
2. **Alerting**: Jika kapasitas > 85%, sistem menandai bin sebagai "PENUH" di peta admin agar petugas dapat segera melakukan pengangkutan.

---

## 🛠️ Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+), MySQL/SQLite, Spatie Permission.
- **Frontend Admin**: React 18, Vite, TypeScript, TailwindCSS, Lucide Icons.
- **Charts & Maps**: Recharts (Statistik), Mapbox GL (Peta Lokasi).
- **Komunikasi**: REST API, WebSockets (Broadcasting).

---

## 📦 Instalasi & Setup

### 1. Prasyarat
- PHP 8.2 & Composer
- Node.js (LTS) & NPM
- Database (MySQL atau SQLite)

### 2. Langkah Instalasi
```bash
# 1. Clone repository
git clone <repository-url>
cd smartbin-api

# 2. Install dependensi Backend (PHP)
composer install

# 3. Install dependensi Frontend (JS)
npm install

# 4. Setup Environment
cp .env.example .env
php artisan key:generate

# 5. Database Setup
# Buat database kosong terlebih dahulu di MySQL
php artisan migrate
php artisan db:seed --class=RolePermissionSeeder

# 6. Build atau Jalankan Development Server
# Terminal 1 (Backend)
php artisan serve

# Terminal 2 (Frontend Watcher)
npm run dev
```

### 🗺️ Konfigurasi Mapbox (Peta)
Agar peta pada menu **Perangkat IoT** dapat muncul, pastikan Anda telah menyetel token Mapbox di file `.env`:

```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token_here
```
*Catatan: Jika Anda menggunakan token sendiri, pastikan domain `localhost` sudah diizinkan di dashboard Mapbox Anda.*

---

## 📖 Panduan Penggunaan Admin

### Akses Dashboard
- Masuk ke URL default `http://localhost:8000`.
- Jika Anda belum memiliki akun, gunakan seeder untuk membuat akun admin default:
  - **Email**: `admin@smartbin.com`
  - **Password**: `password`

### Kelola Perangkat IoT
1. Buka menu **"Perangkat IoT"**.
2. Anda dapat melihat distribusi bin di peta Mapbox.
3. Gunakan tombol **"Tambah Perangkat"** untuk meregistrasi unit SmartBin baru dengan koordinat latitude/longitude yang akurat.

### Moderasi Member Baru
1. Buka menu **"Moderasi Member"**.
2. Cek tab **"Verifikasi"** untuk melihat pendaftar baru dari aplikasi mobile.
3. Klik ikon "Check" untuk menyetujui member agar mereka bisa mulai menukarkan botol.

---

## 🔐 Keamanan
- Seluruh endpoint administrasi dilindungi oleh middleware `auth:sanctum` dan `role:admin`.
- Enkripsi data sensitif (Password/PIN) menggunakan Bcrypt.
- Proteksi CSRF dan Rate Limiting pada endpoint IoT untuk mencegah serangan brute force.

---

**Satu botol, satu poin, untuk Pamekasan yang lebih bersih.** 🌿
