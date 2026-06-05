# Risk Profiler Frontend

Risk Profiler Frontend adalah aplikasi web untuk membantu analis menilai risiko pembiayaan UMKM. Aplikasi ini menerima data operasional merchant, mengirimkannya ke backend machine learning, lalu menampilkan skor risiko, rekomendasi plafon, faktor penjelas, dan aksi keputusan analis.

Proyek ini dikembangkan untuk PIDI DIGDAYA X HACKATHON 2026 sebagai antarmuka review risiko yang terhubung dengan Risk Profiler Backend.

## Fitur Utama

- Input data UMKM dengan validasi form.
- Integrasi prediksi risiko ke backend FastAPI.
- Dashboard pengajuan dengan pencarian, filter status, filter kategori, dan filter plafon.
- Halaman detail untuk skor risiko, band, confidence, rekomendasi plafon, breakdown faktor, dan sumber data.
- Aksi keputusan analis: approve, reject, dan revisi plafon.
- Export laporan analisis risiko dalam format PDF.
- Penyimpanan sementara menggunakan `localStorage` untuk kebutuhan demo dan development.

## Stack Teknologi

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- React Hook Form
- Zod
- Framer Motion
- Lucide React
- Radix UI
- Sonner

## Prasyarat

```txt
Node.js >= 20.18.0
npm >= 10.0.0
```

Backend API dikonfigurasi melalui environment variable:

```env
NEXT_PUBLIC_RISK_API_URL=http://127.0.0.1:8000
```

Jika env tidak diisi, frontend memakai fallback `http://127.0.0.1:8000`.

## Menjalankan Lokal

```bash
cd risk-profiler-web
npm install
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:3000
```

## Script

| Script | Keterangan |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan production server |
| `npm run lint` | Menjalankan ESLint |

## Struktur Singkat

```txt
app/                 # Route utama aplikasi
components/          # Komponen UI dan feature components
lib/                 # API client, normalizer, storage, report, dan helper
public/              # Asset statis
```

Route utama:

```txt
/             Landing page
/data_input   Form input data UMKM
/details      Detail hasil analisis risiko
/dashboard    Daftar pengajuan UMKM
/debitur      Redirect ke dashboard
```

## Integrasi Backend

Frontend menggunakan endpoint backend berikut:

```txt
POST /predict
POST /decisions
```

Pastikan backend berjalan dan origin frontend sudah diizinkan oleh konfigurasi CORS backend.

## Catatan Data

Data pengajuan disimpan sementara di browser melalui `localStorage`. Data dapat hilang jika storage browser dibersihkan dan belum tersimpan permanen di database.

## Tim

- Aditya Cakti Chandrasa: Project Manager
- Nabil Muhammad Hilmi: Lead Engineer
- Zahran Muhammad Syahbana Fardiaz: Machine Learning and Data Pipeline
- Muhammad Ghazi Ali Asy'ary: Risk and Actuary

## Lisensi

Proyek ini dikembangkan untuk Digdaya x Hackathon 2026. Penggunaan, distribusi, dan hak kekayaan intelektual mengikuti ketentuan penyelenggara kompetisi dan kesepakatan tim.
