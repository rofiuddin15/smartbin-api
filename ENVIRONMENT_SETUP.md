# Environment Configuration Guide

## .env Configuration

### Application Settings

```env
APP_NAME="Smart Bin API"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000
```

### Database Configuration

#### SQLite (Development)

```env
DB_CONNECTION=sqlite
```

#### MySQL (Production)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartbin_db
DB_USERNAME=root
DB_PASSWORD=
```

### Broadcasting Configuration

#### For Development (Log)

```env
BROADCAST_CONNECTION=log
```

#### For Production (Pusher)

```env
BROADCAST_CONNECTION=pusher

PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

#### For Production (Redis + Socket.io)

```env
BROADCAST_CONNECTION=redis

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Queue Configuration

#### For Development (Sync)

```env
QUEUE_CONNECTION=sync
```

#### For Production (Database)

```env
QUEUE_CONNECTION=database
```

#### For Production (Redis)

```env
QUEUE_CONNECTION=redis
```

### Cache Configuration

#### For Development (File)

```env
CACHE_STORE=file
```

#### For Production (Redis)

```env
CACHE_STORE=redis
```

### Mail Configuration

#### For Development (Log)

```env
MAIL_MAILER=log
```

#### For Production (SMTP)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@smartbin.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Session Configuration

```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
```

### Filesystem Configuration

```env
FILESYSTEM_DISK=local
```

For cloud storage:

```env
FILESYSTEM_DISK=s3

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

### Payment Gateway (Future Integration)

#### Midtrans

```env
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

#### Xendit

```env
XENDIT_SECRET_KEY=your_secret_key
XENDIT_PUBLIC_KEY=your_public_key
XENDIT_WEBHOOK_TOKEN=your_webhook_token
```

### Business Logic Configuration

You can add custom configurations in config/smartbin.php:

```env
# Points Configuration
POINTS_PER_BOTTLE=10
POINTS_TO_RUPIAH_RATE=10
MINIMUM_REDEEM_POINTS=100

# Smart Bin Configuration
BIN_CAPACITY_THRESHOLD=90
BIN_OFFLINE_THRESHOLD_MINUTES=30

# E-Wallet Integration
EWALLET_ENABLED=true
EWALLET_PROVIDERS=gopay,ovo,dana,shopeepay
```

## Security Best Practices

### Development

-   Keep `APP_DEBUG=true` for better error messages
-   Use SQLite for quick setup
-   Use `log` driver for mail and broadcasting

### Production

-   **CRITICAL:** Set `APP_DEBUG=false`
-   **CRITICAL:** Set `APP_ENV=production`
-   Use strong `APP_KEY` (auto-generated)
-   Use MySQL/PostgreSQL for database
-   Use Redis for cache and queues
-   Enable HTTPS only
-   Setup proper CORS configuration
-   Use environment-specific credentials
-   Never commit .env file to version control

## CORS Configuration

Add to `config/cors.php` or use Laravel CORS package:

```php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'http://localhost:3000',  // React/Vue dev server
    'https://your-production-domain.com'
],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

## Rate Limiting

Configure in `app/Http/Kernel.php`:

```php
'api' => [
    'throttle:60,1', // 60 requests per minute
],
```

For different endpoints:

```php
'throttle:strict' => 'throttle:10,1',  // Strict limit
'throttle:loose' => 'throttle:100,1',   // Loose limit
```

## Monitoring & Logging

### Log Channels

```env
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=debug  # Use 'info' or 'error' in production
```

### Error Tracking (Optional)

```env
# Sentry
SENTRY_LARAVEL_DSN=your_sentry_dsn

# Bugsnag
BUGSNAG_API_KEY=your_bugsnag_key
```

## Performance Optimization

### Optimize for Production

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize composer autoloader
composer install --optimize-autoloader --no-dev
```

### Clear Caches

```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

## Server Requirements

### Minimum

-   PHP >= 8.2
-   BCMath PHP Extension
-   Ctype PHP Extension
-   Fileinfo PHP Extension
-   JSON PHP Extension
-   Mbstring PHP Extension
-   OpenSSL PHP Extension
-   PDO PHP Extension
-   Tokenizer PHP Extension
-   XML PHP Extension

### Recommended

-   Redis (for cache, queue, and broadcasting)
-   Supervisor (for queue workers)
-   Nginx or Apache with proper configuration
-   MySQL 8.0+ or PostgreSQL 12+

## Queue Workers

For production, run queue workers with Supervisor:

```ini
[program:smartbin-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/worker.log
```

Start workers:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start smartbin-worker:*
```

## Scheduled Tasks

Add to crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## Health Checks

-   **API Health:** `GET /api/health`
-   **Laravel Health:** `GET /up`

Monitor these endpoints to ensure API availability.
