# Payment service — VPS deploy (payment.araaye.com)

سرویس پرداخت مستقل با IP ثابت ایرانی برای تماس با `api.zibal.ir`.

## پیش‌نیازها

1. VPS ایرانی (Ubuntu 22.04+) با IP ثابت
2. DNS: `payment.araaye.com` → IP VPS
3. IP سرور را در پنل زیبال whitelist کنید
4. Node.js 20+

## نصب

```bash
# روی VPS
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo mkdir -p /opt/araaye-payment
sudo chown $USER:$USER /opt/araaye-payment
cd /opt/araaye-payment

# کپی فایل‌های payment-service از repo
# (یا git clone + cd payment-service)
npm install --production
```

## Environment

فایل `/opt/araaye-payment/.env`:

```env
PORT=3001
ZIBAL_MERCHANT=your-production-merchant-id
PAYMENT_SERVICE_SECRET=<same-as-vercel-64-char-random>
SITE_URL=https://araaye.com
```

## systemd

```bash
sudo cp deploy/araaye-payment.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable araaye-payment
sudo systemctl start araaye-payment
sudo systemctl status araaye-payment
```

## nginx + SSL

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/payment.araaye.com
sudo ln -sf /etc/nginx/sites-available/payment.araaye.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d payment.araaye.com
sudo systemctl reload nginx
```

## Vercel env vars

```
PAYMENT_SERVICE_URL=https://payment.araaye.com
PAYMENT_SERVICE_SECRET=<same-secret>
PAYMENT_CALLBACKS_ENABLED=true
```

فاز ۱ (فقط proxy): `PAYMENT_CALLBACKS_ENABLED` را unset بگذارید — callbackها همچنان روی `araaye.com` می‌مانند.

فاز ۲ (callback روی VPS): `PAYMENT_CALLBACKS_ENABLED=true`

## Healthcheck

```bash
curl https://payment.araaye.com/health
```

## تست proxy

```bash
curl -X POST https://payment.araaye.com/zibal/request \
  -H "Content-Type: application/json" \
  -H "X-Payment-Secret: $PAYMENT_SERVICE_SECRET" \
  -d '{"amountToman":1000,"callbackUrl":"https://araaye.com/api/ai/verify","description":"test","orderId":"test-1"}'
```
