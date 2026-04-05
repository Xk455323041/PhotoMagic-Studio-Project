# Nginx deployment for PhotoMagic API

This directory contains an example Nginx config for exposing the backend ID photo API
through a standard domain and port.

## Domain

- `api.photomagic-studio.shop`

## Backend upstream

- `http://127.0.0.1:3002`

## Files

- `api.photomagic-studio.shop.conf` — HTTP reverse proxy config for `/api/v1/id-photo/`

## Install on server

Copy the config into your Nginx config directory, for example:

```bash
sudo cp deploy/nginx/api.photomagic-studio.shop.conf /etc/nginx/conf.d/api.photomagic-studio.shop.conf
sudo nginx -t
sudo systemctl reload nginx
```

## DNS

Create a DNS record:

- Type: `A`
- Name: `api`
- Value: `101.32.246.47`
- Proxy status: `DNS only` first during troubleshooting

## Test HTTP upstream via domain

```bash
curl -i 'http://api.photomagic-studio.shop/api/v1/id-photo/tasks' \
  -X POST \
  -H 'Content-Type: application/json' \
  --data '{"file_id":"645bef7e-5334-4781-b1b6-11574371012e","parameters":{}}'
```

Expected result: `202 Accepted`

## Recommended final Pages variable

After HTTPS is configured on the API domain, set the Pages environment variable:

```txt
ID_PHOTO_API_URL=https://api.photomagic-studio.shop/api/v1/id-photo
```

During temporary HTTP testing, you may use:

```txt
ID_PHOTO_API_URL=http://api.photomagic-studio.shop/api/v1/id-photo
```

## Optional HTTPS Nginx template

```nginx
server {
    listen 80;
    server_name api.photomagic-studio.shop;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.photomagic-studio.shop;

    ssl_certificate /etc/letsencrypt/live/api.photomagic-studio.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.photomagic-studio.shop/privkey.pem;

    location /api/v1/id-photo/ {
        proxy_pass http://127.0.0.1:3002/api/v1/id-photo/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```
