# Risk Profiler

Platform credit scoring berbasis AI untuk analisis pembiayaan UMKM.

## Deskripsi

Risk Profiler adalah aplikasi web modern yang dirancang untuk membantu analis mengevaluasi kelayakan kredit UMKM menggunakan sistem penilaian risiko berbasis AI.

Sistem ini menganalisis berbagai variabel bisnis seperti aktivitas QRIS, usia bisnis, rating e-commerce, dan perilaku pembayaran untuk menghasilkan:

* Skor risiko kredit
* Kategori risiko
* Rekomendasi plafon pembiayaan
* Rekomendasi berbasis AI
* Breakdown kontribusi variabel
* Dashboard review debitur

Project ini menggabungkan frontend modern dengan backend machine learning menggunakan FastAPI.

---

# Fitur Utama

## AI Credit Scoring

Menghasilkan analisis risiko kredit secara otomatis menggunakan backend FastAPI dan model machine learning.

## Input Data UMKM

Form input data UMKM yang responsif dan tervalidasi.

Data yang dianalisis:

* Kategori bisnis
* Usia bisnis
* Volume transaksi QRIS
* Hari aktif QRIS
* Rating e-commerce
* Keterlambatan pembayaran PLN

## Dashboard Analisis Risiko

Menampilkan hasil analisis seperti:

* Risk score
* Tingkat risiko
* Rekomendasi plafon
* Klasifikasi band
* Confidence model

## Breakdown Kontribusi

Visualisasi kontribusi setiap variabel terhadap skor akhir.

## Interface Responsif

UI fully responsive yang dioptimalkan untuk:

* Desktop
* Tablet
* Mobile

## Penyimpanan Data Lokal

Menggunakan localStorage browser sebagai simulasi database selama proses development.

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Lucide React
* React Hook Form
* Zod

## Backend

* FastAPI
* Python
* Pandas
* Joblib
* Scikit-learn

## Machine Learning

Sistem AI menggunakan:

* Encoder kategori
* Feature scaling
* Model klasifikasi terlatih

Model machine learning dimuat menggunakan Joblib.

---

# Struktur Project

```txt
app/
├── dashboard/
├── details/
├── data_input/
├── api/

components/
├── details/
├── debitur/
├── ui/
├── navbar/

lib/
├── gauges.ts
├── menus.ts

api/
├── models/
├── schemas/
├── services/
├── main.py
```

---

# Highlight UI

## Dashboard Modern

* Layout enterprise modern
* Sidebar mobile interaktif
* Risk indicator visual
* Smooth animation
* Mobile-friendly carousel

## Sistem Risiko Visual

Level risiko divisualisasikan menggunakan gauge berwarna:

| Range Skor | Kategori      |
| ---------- | ------------- |
| 0–25       | Sangat Rendah |
| 25–50      | Rendah        |
| 50–75      | Baik          |
| 75–100     | Sangat Baik   |

---

# Cara Kerja Sistem

1. User menginput data UMKM
2. Frontend melakukan validasi menggunakan Zod
3. Data dikirim ke backend FastAPI
4. Model machine learning melakukan prediksi
5. Hasil dikembalikan ke frontend
6. Dashboard menampilkan analisis dan rekomendasi

---

# Instalasi Project

## Frontend

Install dependencies:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:3000
```

---

## Backend

Install dependencies:

```bash
pip install fastapi uvicorn pandas scikit-learn joblib
```

Jalankan server FastAPI:

```bash
uvicorn api.main:app --reload
```

Backend berjalan di:

```txt
http://127.0.0.1:8000
```

Swagger documentation:

```txt
http://127.0.0.1:8000/docs
```

---

# Pengembangan Selanjutnya

Fitur yang direncanakan:

* Sistem autentikasi
* Integrasi database asli
* Workflow approval analis
* Export laporan PDF
* Real-time analytics
* Multi-user support
* Cloud deployment
* Riwayat scoring debitur
* Retraining model machine learning

---

# Tampilan Sistem

Halaman yang tersedia:

* Dashboard overview
* Review debitur
* Detail analisis risiko
* Sistem rekomendasi AI
* Sidebar mobile responsif
* Form input data UMKM

---

# Catatan Development

Project ini berfokus pada:

* Arsitektur komponen yang rapi
* Responsive enterprise UI
* Integrasi backend yang mudah dipahami
* Implementasi machine learning sederhana
* Simulasi workflow fintech nyata

---

# Author

Dibuat oleh Nabil Hilmi.

Berfokus pada frontend engineering, backend integration, dan sistem fintech berbasis AI.
