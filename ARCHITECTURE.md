# Smart Bin System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMART BIN ECOSYSTEM                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Mobile App      │       │   Smart Bin      │       │   Admin Panel    │
│  (Android)       │       │   (Tablet)       │       │   (Web)          │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         │        REST API          │                          │
         └──────────┬───────────────┴──────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │                     │
         │   Backend API       │
         │   (Laravel 12)      │
         │                     │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │                     │
         │   Database          │
         │   (MySQL/SQLite)    │
         │                     │
         └─────────────────────┘
```

---

## Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND LAYERS                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  API Layer (routes/api.php)                                 │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Auth    │  User    │  Smart   │  Trans   │  Redeem  │  │
│  │  Routes  │  Routes  │  Bin     │  Routes  │  Routes  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Middleware Layer                                           │
│  ┌────────────┬──────────────┬─────────────┬────────────┐  │
│  │  Sanctum   │  Throttle    │  CORS       │  Validate  │  │
│  │  Auth      │  Limit       │             │            │  │
│  └────────────┴──────────────┴─────────────┴────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Controller Layer                                           │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │  Auth        │  User        │  SmartBin            │    │
│  │  Controller  │  Controller  │  Controller          │    │
│  ├──────────────┼──────────────┼──────────────────────┤    │
│  │  Transaction │  Redeem      │                      │    │
│  │  Controller  │  Controller  │                      │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Business Logic Layer                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  - Point Calculation                               │    │
│  │  - E-wallet Conversion                             │    │
│  │  - Transaction Management                          │    │
│  │  - PIN Validation                                  │    │
│  │  - GPS Distance Calculation                        │    │
│  └────────────────────────────────────────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Model Layer (Eloquent ORM)                                 │
│  ┌──────────┬──────────┬──────────┬───────────────────┐    │
│  │  User    │  SmartBin│  Trans   │  PointTransaction │    │
│  │  Model   │  Model   │  Model   │  Model            │    │
│  └──────────┴──────────┴──────────┴───────────────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Database Layer                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  MySQL / PostgreSQL / SQLite                       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Supporting Services                                        │
│  ┌──────────────┬──────────────┬─────────────────────┐    │
│  │  Broadcasting│  Queue       │  Cache              │    │
│  │  (Pusher)    │  (Database)  │  (Redis)            │    │
│  └──────────────┴──────────────┴─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌───────────────────────────────────────────────────────┐
│  users                                                │
├───────────────────────────────────────────────────────┤
│  id (PK)                                              │
│  name                                                 │
│  email (unique)                                       │
│  password (hashed)                                    │
│  phone_number (unique)                                │
│  pin (hashed)                                         │
│  total_points                                         │
│  timestamps                                           │
└────────────┬──────────────────────────────────────────┘
             │ 1
             │
             │ *
┌────────────▼──────────────────────────────────────────┐
│  transactions                                         │
├───────────────────────────────────────────────────────┤
│  id (PK)                                              │
│  user_id (FK) ────────────────────────────────────────┤
│  smart_bin_id (FK, nullable)                          │
│  type (deposit|redeem)                                │
│  points                                               │
│  bottles_count                                        │
│  ewallet_type                                         │
│  ewallet_account                                      │
│  ewallet_amount                                       │
│  status (pending|completed|failed)                    │
│  notes                                                │
│  timestamps                                           │
└────────────┬──────────────────────────────────────────┘
             │ 1
             │
             │ 1
┌────────────▼──────────────────────────────────────────┐
│  point_transactions                                   │
├───────────────────────────────────────────────────────┤
│  id (PK)                                              │
│  user_id (FK)                                         │
│  transaction_id (FK)                                  │
│  points_before                                        │
│  points_change                                        │
│  points_after                                         │
│  description                                          │
│  timestamps                                           │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  smart_bins                                           │
├───────────────────────────────────────────────────────┤
│  id (PK)                                              │
│  bin_code (unique)                                    │
│  name                                                 │
│  location                                             │
│  latitude                                             │
│  longitude                                            │
│  status (online|offline|full|maintenance)             │
│  capacity_percentage                                  │
│  total_bottles_collected                              │
│  last_online_at                                       │
│  timestamps                                           │
└───────────────────────────────────────────────────────┘
```

---

## API Flow Diagrams

### 1. User Registration Flow

```
Mobile App          Backend API         Database
    │                   │                   │
    ├──POST /register──>│                   │
    │                   │                   │
    │                   ├──Validate────────>│
    │                   │                   │
    │                   ├──Hash Password───>│
    │                   │                   │
    │                   ├──Hash PIN────────>│
    │                   │                   │
    │                   ├──Create User─────>│
    │                   │<──User Created────┤
    │                   │                   │
    │                   ├──Generate Token──>│
    │                   │                   │
    │<──User + Token────┤                   │
    │                   │                   │
```

### 2. Deposit Flow (Smart Bin)

```
Smart Bin           Backend API         Database        User
    │                   │                   │            │
    ├──Validate PIN────>│                   │            │
    │<──User Data───────┤                   │            │
    │                   │                   │            │
    ├──User inserts─────┤                   │            │
    │   bottles         │                   │            │
    │                   │                   │            │
    ├──POST deposit────>│                   │            │
    │   (5 bottles)     │                   │            │
    │                   ├──BEGIN TRANS─────>│            │
    │                   │                   │            │
    │                   ├──Create Trans────>│            │
    │                   │                   │            │
    │                   ├──Update Points───>│            │
    │                   │   (500 → 550)     │            │
    │                   │                   │            │
    │                   ├──Create Log──────>│            │
    │                   │                   │            │
    │                   ├──Update Bin─────>│            │
    │                   │   Stats           │            │
    │                   │                   │            │
    │                   ├──COMMIT──────────>│            │
    │                   │                   │            │
    │                   ├──Broadcast Event─────────────>│
    │                   │   (PointsUpdated)             │
    │                   │                   │            │
    │<──Success─────────┤                   │            │
    │   +50 points      │                   │            │
    │                   │                   │            │
```

### 3. Redeem Flow

```
Mobile App          Backend API         Database        Payment Gateway
    │                   │                   │                 │
    ├──GET packages────>│                   │                 │
    │<──Package list────┤                   │                 │
    │                   │                   │                 │
    ├──POST calculate──>│                   │                 │
    │<──Amount: Rp──────┤                   │                 │
    │                   │                   │                 │
    ├──POST redeem─────>│                   │                 │
    │   (100 points)    │                   │                 │
    │                   ├──Validate Points─>│                 │
    │                   │                   │                 │
    │                   ├──BEGIN TRANS─────>│                 │
    │                   │                   │                 │
    │                   ├──Create Trans────>│                 │
    │                   │   (status:pending)│                 │
    │                   │                   │                 │
    │                   ├──Deduct Points───>│                 │
    │                   │   (550 → 450)     │                 │
    │                   │                   │                 │
    │                   ├──Create Log──────>│                 │
    │                   │                   │                 │
    │                   ├──Process Payment─────────────────>│
    │                   │                   │                 │
    │                   │<──Success─────────────────────────┤
    │                   │                   │                 │
    │                   ├──Update Trans────>│                 │
    │                   │   (status:completed)               │
    │                   │                   │                 │
    │                   ├──COMMIT──────────>│                 │
    │                   │                   │                 │
    │                   ├──Broadcast Event──│                 │
    │                   │                   │                 │
    │<──Success─────────┤                   │                 │
    │                   │                   │                 │
```

---

## Real-time Communication

```
┌─────────────────────────────────────────────────────────┐
│  WebSocket / Broadcasting Architecture                  │
└─────────────────────────────────────────────────────────┘

Mobile App                Backend API              Pusher/Redis
    │                         │                         │
    │──Connect to channel────>│                         │
    │   user.1                │                         │
    │                         │──Register listener─────>│
    │                         │                         │
    │                         │                         │
    │                   [Transaction Occurs]            │
    │                         │                         │
    │                         ├──Dispatch Event────────>│
    │                         │   PointsUpdated         │
    │                         │                         │
    │<──Receive event─────────┼─────────────────────────┤
    │   {                     │                         │
    │     "total_points": 550 │                         │
    │   }                     │                         │
    │                         │                         │
    │──Update UI──────────────┤                         │
    │                         │                         │
```

### Broadcasting Channels

**Private Channels:**

-   `user.{id}` - Personal user updates (points, transactions)

**Public Channels:**

-   `smart-bins` - All smart bin status updates
-   `smart-bin.{id}` - Specific smart bin updates

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Security Layers                                        │
└─────────────────────────────────────────────────────────┘

Request
   │
   ├── HTTPS/SSL
   │
   ├── CORS Policy
   │
   ├── Rate Limiting (60 req/min)
   │
   ├── Sanctum Authentication
   │      ├── Token Validation
   │      └── User Authentication
   │
   ├── Input Validation
   │      ├── Request Rules
   │      └── Data Sanitization
   │
   ├── Authorization
   │      ├── User ownership check
   │      └── Permission validation
   │
   ├── Business Logic
   │
   └── Response
```

### Data Security

```
┌──────────────────────────────────────────┐
│  Sensitive Data Protection               │
├──────────────────────────────────────────┤
│  Password  ──>  bcrypt hash (12 rounds) │
│  PIN       ──>  bcrypt hash (12 rounds) │
│  Token     ──>  SHA-256 hash            │
│  API Key   ──>  Environment variable    │
└──────────────────────────────────────────┘
```

---

## Deployment Architecture (Production)

```
                    Internet
                       │
                ┌──────▼──────┐
                │  CloudFlare │
                │  (CDN/WAF)  │
                └──────┬──────┘
                       │
                ┌──────▼──────┐
                │  Load       │
                │  Balancer   │
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼───┐      ┌───▼───┐     ┌───▼───┐
    │ App   │      │ App   │     │ App   │
    │ Server│      │ Server│     │ Server│
    │   #1  │      │   #2  │     │   #3  │
    └───┬───┘      └───┬───┘     └───┬───┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼───┐      ┌───▼───┐     ┌───▼───┐
    │ MySQL │      │ Redis │     │ Queue │
    │Master │      │ Cache │     │Worker │
    └───┬───┘      └───────┘     └───────┘
        │
    ┌───▼───┐
    │ MySQL │
    │ Slave │
    └───────┘
```

---

## Scalability Considerations

### Horizontal Scaling

-   Multiple app servers behind load balancer
-   Stateless API (token-based auth)
-   Database read replicas
-   Redis for session/cache
-   Queue workers for async tasks

### Vertical Scaling

-   Database optimization (indexes, query optimization)
-   Cache frequently accessed data
-   CDN for static assets
-   Connection pooling

### Performance Optimization

-   Response caching
-   Database query optimization
-   Eager loading relationships
-   API pagination
-   Background job processing

---

## Monitoring & Logging

```
Application
    │
    ├─> Application Logs (Laravel Log)
    │       └─> Storage/logs/laravel.log
    │
    ├─> Error Tracking (Sentry/Bugsnag)
    │       └─> Real-time error monitoring
    │
    ├─> Performance Monitoring (New Relic)
    │       └─> Response time, throughput
    │
    ├─> Database Monitoring (MySQL Slow Query Log)
    │       └─> Query performance
    │
    └─> Server Monitoring (Prometheus/Grafana)
            └─> CPU, Memory, Disk usage
```

---

**System Architecture - Smart Bin Backend API**  
**Version:** 1.0  
**Last Updated:** November 2025
