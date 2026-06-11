# Dermify Admin Dashboard

Dashboard Next.js ini memakai proxy server-side `/api/dermify/*`. Browser tidak
memanggil FastAPI secara langsung, sehingga deployment HTTPS Vercel tetap dapat
berkomunikasi dengan backend HTTPS di VPS tanpa masalah CORS.

## Local development

Isi `.env.local`:

```env
DERMIFY_API_URL=http://127.0.0.1:8001
```

Kemudian jalankan:

```bash
npm install
npm run dev
```

## Production architecture

```text
Browser -> HTTPS Vercel -> Next.js API proxy -> HTTPS Nginx VPS -> FastAPI :8000
```

Public VPS:

```text
43.156.119.43
```

Alamat private `10.3.0.14` hanya dapat digunakan dari jaringan internal VPS dan
tidak dapat dijangkau oleh Vercel.

## Setup backend di VPS

1. Jalankan FastAPI hanya pada `127.0.0.1:8000` atau melalui container dengan
   port tersebut tersedia di host.
2. Arahkan domain/subdomain API, misalnya `api.example.com`, ke
   `43.156.119.43`.
3. Pasang Nginx sebagai reverse proxy ke `127.0.0.1:8000`, lalu aktifkan
   sertifikat TLS/HTTPS untuk domain API tersebut.
4. Buka inbound TCP `80` dan `443` pada firewall VPS/security group. Jangan
   membuka MySQL `3306` atau Uvicorn `8000` ke internet.
5. Pastikan `.env` backend memiliki `APP_ENV=production`, `DEBUG=false`,
   `SECRET_KEY` acak yang kuat, dan konfigurasi database production.
6. Restart backend dan Nginx, lalu uji dari komputer lain:

```bash
curl https://api.example.com/docs
```

Konfigurasi Nginx awal sudah tersedia pada backend di
`deployment/nginx-no-domain.conf`. Ganti path `/home/skincare/...` bila lokasi
project di VPS berbeda. Akses `http://43.156.119.43` dapat dipakai untuk tes
awal, tetapi tidak aman untuk production karena kredensial login dan JWT akan
melewati internet tanpa enkripsi.

## Deploy ke Vercel

1. Import repository dashboard ke Vercel.
2. Tambahkan Environment Variable berikut untuk Production, Preview, dan
   Development:

```env
DERMIFY_API_URL=https://api.example.com
```

3. Deploy ulang setelah environment variable disimpan.
4. Buka halaman login dashboard dan masuk menggunakan akun dengan
   `role = admin`.

Jangan memakai prefix `NEXT_PUBLIC_` untuk alamat backend atau secret server.
Dashboard meneruskan JWT admin dari browser, sedangkan FastAPI tetap melakukan
otorisasi pada setiap endpoint `/metrics/*`.

## Pemeriksaan masalah

- `502` dari `/api/dermify/...`: Vercel tidak dapat menjangkau VPS. Periksa
  Nginx, firewall TCP 443, sertifikat TLS, dan nilai `DERMIFY_API_URL`.
- `401`: token login tidak ada/tidak valid atau `SECRET_KEY` backend berubah.
- `403` saat login: akun ada tetapi kolom `role` bukan `admin`.
- Jangan gunakan `10.3.0.14` di Vercel karena itu IP private.
