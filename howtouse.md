# How To Use - Frontend Risk Profiler

Dokumen ini menjelaskan cara menjalankan dan memakai frontend Risk Profiler.

## 1. Masuk ke Folder Frontend

```bash
cd risk-profiler-web
```

## 2. Install Dependency

```bash
npm install
```

## 3. Konfigurasi Backend API

Pastikan file `.env.local` berisi URL backend:

```env
NEXT_PUBLIC_RISK_API_URL=http://127.0.0.1:8000
```

Jika backend berjalan di port lain, sesuaikan value tersebut.

Contoh:

```env
NEXT_PUBLIC_RISK_API_URL=http://127.0.0.1:8001
```

Setelah mengubah `.env.local`, restart dev server frontend.

## 4. Jalankan Frontend

```bash
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:3000
```

atau:

```txt
http://127.0.0.1:3000
```

## 5. Build Production

```bash
npm run build
```

Jalankan production server:

```bash
npm run start
```

## 6. Workflow Penggunaan Aplikasi

### 1. Buka halaman input

Masuk ke:

```txt
/data_input
```

Isi data UMKM:

```txt
Nama UMKM
Kategori bisnis
Usia usaha
Volume QRIS bulanan
Hari aktif QRIS
Rating e-commerce
Keterlambatan PLN
Rata-rata tagihan PDAM
Keterlambatan PDAM
```

Klik:

```txt
Generate Risk Profile
```

### 2. Review hasil analisis

Setelah submit berhasil, aplikasi membuka:

```txt
/details
```

Halaman ini menampilkan:

```txt
Skor risiko
Band
Rekomendasi plafon
Breakdown kontribusi
Faktor utama model
Rekomendasi sistem
Sumber data
```

### 3. Ambil keputusan

Di halaman detail, analis bisa memilih:

```txt
Rekomendasikan Approval
Ajukan Revisi Plafon
Rekomendasikan Penolakan
```

Setelah keputusan dipilih, tombol aksi lain akan disembunyikan dan diganti status profesional:

```txt
Pengajuan diterima
Revisi plafon sedang diajukan
Pengajuan ditolak
```

Jika ingin mengganti keputusan, klik:

```txt
Ubah Keputusan
```

### 4. Buka dashboard

Masuk ke:

```txt
/dashboard
```

Dashboard menampilkan daftar pengajuan yang tersimpan di browser.

Fitur dashboard:

```txt
Filter status
Pencarian UMKM
Review detail
Approve
Reject
Delete pengajuan lokal
```

### 5. Download laporan PDF

Di halaman detail, klik tombol download report untuk membuat PDF.

PDF berisi:

```txt
Ringkasan eksekutif
Profil pengajuan
Skor risiko
Rekomendasi plafon
Penjelasan model
Faktor utama
Data input
Breakdown kontribusi
Rekomendasi analis
Catatan keputusan
```

## 7. Penyimpanan Data

Frontend saat ini memakai `localStorage`.

Key yang digunakan:

```txt
debitur_list
selected_debitur
prediction_result
```

Artinya:

```txt
Data hanya tersimpan di browser yang sama.
Data bisa hilang jika localStorage dibersihkan.
Data belum tersimpan permanen di database.
```

## 8. Troubleshooting

### Frontend tidak bisa fetch API

Pastikan backend berjalan:

```txt
http://127.0.0.1:8000/health
```

Pastikan `.env.local` benar:

```env
NEXT_PUBLIC_RISK_API_URL=http://127.0.0.1:8000
```

Restart frontend setelah mengubah env.

### CORS error

Pastikan frontend berjalan di:

```txt
http://localhost:3000
```

atau:

```txt
http://127.0.0.1:3000
```

Jika memakai port lain, backend perlu menambahkan origin tersebut di `api/main.py`.

### Submit lama atau gagal

Pastikan backend berhasil load model dan endpoint `/predict` tidak error.

### Data dashboard tidak muncul

Pastikan profil sudah dibuat dari `/data_input`.

Jika ingin reset data lokal, hapus localStorage browser untuk domain frontend.

### Env sudah diubah tapi masih fetch URL lama

Restart dev server:

```bash
npm run dev
```

Next.js membaca `NEXT_PUBLIC_*` saat server dijalankan.
