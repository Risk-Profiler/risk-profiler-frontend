# Risk Profiler Frontend

Risk Profiler Frontend adalah aplikasi web Next.js untuk membantu analis menilai risiko pembiayaan UMKM. Aplikasi ini menyediakan workflow mulai dari input data operasional merchant, pengiriman data ke backend machine learning, review hasil scoring, pengambilan keputusan analis, sampai pembuatan laporan PDF.

Frontend ini dikembangkan untuk kebutuhan PIDI DIGDAYA X HACKATHON 2026 sebagai antarmuka review risiko yang terhubung dengan Risk Profiler Backend.

## Fitur Utama

- Form input data UMKM dengan validasi React Hook Form dan Zod.
- Integrasi ke backend melalui endpoint `POST /predict` untuk menghasilkan profil risiko.
- Normalisasi response backend menjadi model data frontend yang konsisten.
- Halaman detail untuk menampilkan skor, band, confidence, rekomendasi plafon, breakdown kontribusi, sumber data, rekomendasi sistem, dan faktor utama model.
- Dashboard pengajuan dengan filter status, pencarian, pengurutan, filter kategori, dan filter range plafon.
- Workflow keputusan analis untuk approval, rejection, dan revision requested.
- Sinkronisasi keputusan ke endpoint backend `POST /decisions` dengan fallback penyimpanan lokal jika request gagal.
- Penyimpanan data sementara menggunakan `localStorage`.
- Export laporan risiko dalam format PDF langsung dari browser.
- Layout responsif dengan sidebar, navbar, skeleton loading, toast notification, dan komponen UI reusable.

## Stack Teknologi

- Node.js 20 atau lebih baru
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- React Hook Form
- Zod
- Framer Motion
- Lucide React
- Radix UI
- shadcn/ui style components
- Sonner toast notification
- Vercel atau Node runtime untuk deployment frontend

## Struktur Proyek

```txt
risk-profiler-web/
|-- app/
|   |-- page.tsx               # Landing page aplikasi
|   |-- layout.tsx             # Root layout, AppShell, font, dan Toaster
|   |-- globals.css            # Global style dan token tema
|   |-- dashboard/
|   |   |-- page.tsx           # Daftar dan filter pengajuan UMKM
|   |-- data_input/
|   |   |-- page.tsx           # Form input data UMKM
|   |-- details/
|   |   |-- page.tsx           # Detail profil risiko dan aksi keputusan
|   |-- debitur/
|       |-- page.tsx           # Redirect ke dashboard
|-- components/
|   |-- details/               # Komponen halaman detail risiko
|   |-- layout/                # App shell, sidebar, navbar, dan navigasi
|   |-- skeletons/             # Skeleton loading untuk halaman detail
|   |-- ui/                    # Komponen UI dasar
|-- lib/
|   |-- api.ts                 # Client request ke backend
|   |-- risk-profile.ts        # Normalisasi response dan bentuk RiskProfile
|   |-- risk-storage.ts        # Helper localStorage untuk profil debitur
|   |-- report.ts              # Generator PDF client-side
|   |-- gauges.ts              # Utilitas visual gauge
|   |-- menus.ts               # Konfigurasi menu navigasi
|   |-- utils.ts               # Helper className
|-- public/                    # Asset statis
|-- package.json
|-- next.config.ts
|-- tsconfig.json
|-- howtouse.md
|-- README.md
```

## Prasyarat

Pastikan Node.js dan npm tersedia sesuai konfigurasi project:

```txt
Node.js >= 20.18.0
npm >= 10.0.0
```

Frontend membutuhkan URL backend melalui environment variable:

```env
NEXT_PUBLIC_RISK_API_URL=http://127.0.0.1:8000
```

Jika environment variable tidak diisi, aplikasi menggunakan fallback:

```txt
http://127.0.0.1:8000
```

Jika value env tidak diawali `http://` atau `https://`, aplikasi akan menormalisasi URL. Contoh `localhost:8000` menjadi `http://localhost:8000`, sedangkan domain publik tanpa protokol akan dianggap menggunakan `https://`.

## Instalasi Lokal

Masuk ke folder frontend:

```bash
cd risk-profiler-web
```

Install dependency:

```bash
npm install
```

Buat atau sesuaikan file `.env.local`:

```env
NEXT_PUBLIC_RISK_API_URL=http://127.0.0.1:8000
```

Jalankan development server:

```bash
npm run dev
```

Frontend akan berjalan di:

```txt
http://localhost:3000
```

atau:

```txt
http://127.0.0.1:3000
```

## Script NPM

| Script | Keterangan |
| --- | --- |
| `npm run dev` | Menjalankan Next.js development server |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan production server setelah build |
| `npm run lint` | Menjalankan ESLint |

## Halaman Aplikasi

### `/`

Landing page sederhana untuk masuk ke workflow analisis risiko.

### `/data_input`

Halaman input data UMKM. Form ini mengumpulkan data berikut:

| Field | Keterangan |
| --- | --- |
| `name` | Nama UMKM yang akan ditampilkan di profil risiko |
| `business_category` | Kategori bisnis, seperti `fnb`, `retail`, `fashion`, `jasa`, atau kategori custom |
| `business_age_months` | Dihitung otomatis dari tanggal mulai usaha |
| `qris_volume_monthly` | Volume QRIS bulanan dalam rupiah |
| `qris_active_days` | Jumlah hari aktif QRIS dalam satu bulan |
| `ecommerce_rating` | Rating e-commerce dengan rentang 0-5 |
| `pln_delay_days` | Jumlah hari keterlambatan pembayaran PLN |
| `pdam_bill_avg` | Rata-rata tagihan PDAM |
| `pdam_late_payments` | Jumlah keterlambatan pembayaran PDAM |

Saat form berhasil disubmit, aplikasi membuat `merchant_id`, mengirim payload ke backend, menyimpan profil ke `localStorage`, lalu membuka halaman `/details`.

### `/details`

Halaman detail hasil analisis risiko. Halaman ini menampilkan:

```txt
Skor risiko
Risk level
Band dan band range
Confidence
Rekomendasi plafon
Breakdown kontribusi
Sumber data
Rekomendasi sistem
Faktor utama model
Catatan keputusan
Debitur serupa berdasarkan kategori
```

Analis dapat melakukan:

```txt
Approve
Reject
Ajukan revisi plafon
Download laporan PDF
Bandingkan dengan debitur serupa
```

### `/dashboard`

Halaman daftar pengajuan UMKM yang tersimpan di browser. Dashboard menyediakan:

```txt
Filter status
Pencarian nama, ID, kategori, risk label, dan status
Urutan submit terbaru atau terlama
Urutan usia usaha tertua atau termuda
Filter range plafon
Filter kategori bisnis
Aksi review, approve, reject, revisi, dan delete
```

### `/debitur`

Route kompatibilitas yang langsung melakukan redirect ke `/dashboard`.

## Integrasi Backend

Konfigurasi client API berada di `lib/api.ts`.

Endpoint yang digunakan:

```txt
POST /predict
POST /decisions
```

Timeout request frontend saat ini:

```txt
12000 ms
```

### Request Prediksi

Frontend mengirim payload ke:

```txt
{NEXT_PUBLIC_RISK_API_URL}/predict
```

Response backend dinormalisasi melalui `normalizeBackendPrediction` dan `createRiskProfile` agar tetap bisa dipakai oleh UI meskipun beberapa field opsional tidak tersedia.

### Request Keputusan

Frontend mengirim keputusan analis ke:

```txt
{NEXT_PUBLIC_RISK_API_URL}/decisions
```

Payload keputusan:

```json
{
  "merchant_id": "UMKM-TEST",
  "status": "Approved",
  "note": "Pengajuan diterima berdasarkan hasil analisis risiko dan rekomendasi plafon.",
  "revision_limit": null
}
```

Status yang didukung:

```txt
Approved
Rejected
Revision Requested
```

Jika sinkronisasi keputusan ke backend gagal, data tetap disimpan secara lokal di browser dan aplikasi menampilkan warning toast.

## Penyimpanan Data

Frontend menggunakan `localStorage` sebagai penyimpanan sementara selama development dan demo.

Key yang digunakan:

```txt
debitur_list
selected_debitur
prediction_result
```

Implikasi:

```txt
Data hanya tersedia di browser yang sama.
Data bisa hilang jika localStorage dibersihkan.
Data belum tersimpan permanen di database.
Data keputusan tetap dicoba untuk disinkronkan ke backend.
```

## Build Production

Jalankan lint:

```bash
npm run lint
```

Buat production build:

```bash
npm run build
```

Jalankan production server:

```bash
npm run start
```

Pastikan `NEXT_PUBLIC_RISK_API_URL` pada environment deployment mengarah ke backend yang aktif dan origin frontend sudah diizinkan oleh konfigurasi CORS backend.

## Troubleshooting

Jika submit form gagal, pastikan backend aktif dan endpoint health dapat diakses:

```txt
http://127.0.0.1:8000/health
```

Jika frontend masih memanggil URL backend lama, restart dev server setelah mengubah `.env.local`:

```bash
npm run dev
```

Jika terjadi CORS error, pastikan frontend berjalan pada origin yang diizinkan backend:

```txt
http://localhost:3000
http://127.0.0.1:3000
```

Jika memakai domain atau port lain, tambahkan origin tersebut pada konfigurasi `CORSMiddleware` di backend.

Jika dashboard kosong, buat profil baru dari halaman `/data_input`. Dashboard membaca data dari `localStorage` browser.

Jika data lokal ingin direset, hapus `localStorage` untuk domain frontend melalui browser developer tools.

Jika build gagal karena versi Node.js, gunakan Node.js 20.18.0 atau lebih baru.

## Tim

- Aditya Cakti Chandrasa: Project Manager
- Nabil Muhammad Hilmi: Lead Engineer
- Zahran Muhammad Syahbana Fardiaz: Machine Learning and Data Pipeline
- Muhammad Ghazi Ali Asy'ary: Risk and Actuary

## Lisensi

Proyek ini dikembangkan untuk Digdaya x Hackathon 2026. Penggunaan, distribusi, dan hak kekayaan intelektual mengikuti ketentuan penyelenggara kompetisi dan kesepakatan tim. 
