# PRODUCT REQUIREMENTS DOCUMENT (PRD) - freelencerjob

**Versi:** 1.0  
**Status:** Draft / Siap Eksekusi  
**Penulis:** Product Director

---

## 1. PENDAHULUAN & VISI PRODUK

*   **Visi Utama:** Menjadi *personal productivity engine* yang menjembatani kesenjangan antara kemampuan teknis seorang guru SD dengan peluang pasar freelance global, melalui otomatisasi kurasi pekerjaan dan pendampingan AI cerdas.
*   **Masalah & Solusi:** 
    *   **Masalah:** Kurangnya waktu untuk mencari proyek, kesulitan memfilter pekerjaan yang sesuai dengan kapasitas AI, dan hambatan komunikasi bahasa/budaya dengan klien internasional.
    *   **Solusi:** Aplikasi *all-in-one* yang melakukan *scrapping* cerdas, memecah tugas kompleks menjadi langkah teknis (AI Mentor), dan bertindak sebagai diplomat komunikasi (AI Assistant).
*   **Target Pengguna & Persona:** Seorang profesional (Guru SD) yang memiliki *skill* teknis (Web Dev, Penulisan) namun memiliki keterbatasan waktu dan pengalaman dalam navigasi pasar freelance global.

---

## 2. RUANG LINGKUP & BATASAN (SCOPE)

*   **In-Scope (MVP):**
    *   Scraper dasar dari platform freelance utama.
    *   AI Mentor untuk memecah *job description* menjadi *micro-tasks*.
    *   AI Communication Assistant untuk draf pesan.
    *   Dashboard personal sederhana.
*   **Out-of-Scope (Fase Selanjutnya):**
    *   Integrasi pembayaran otomatis.
    *   Fitur kolaborasi tim.
    *   *Auto-bidding* (otomatis mengirim lamaran).
    *   Aplikasi *native* (Mobile App).

---

## 3. SPESIFIKASI FITUR FUNGSIONAL

### A. Smart Job Aggregator
*   **Integrasi:** Menggunakan *Headless Browser* (seperti Playwright/Puppeteer) untuk menarik data dari situs freelance.
*   **Filter AI:** Menggunakan LLM (OpenAI API) untuk mengklasifikasikan apakah pekerjaan tersebut "AI-Compatible" (bisa dikerjakan AI + User) atau "High-Risk".
*   **Notifikasi:** Push notification via Telegram Bot agar pengguna mendapatkan info *real-time*.

### B. AI Project Mentor
*   **Micro-tasks:** Mengubah deskripsi proyek menjadi daftar *To-Do List* sistematis.
*   **Generator Panduan:** Memberikan *step-by-step* teknis (misal: struktur kode web atau kerangka modul ajar).
*   **Validasi:** Pengguna mengunggah draf, AI memberikan *feedback* perbaikan sebelum dikirim ke klien.

### C. AI Communication Assistant
*   **Analisis Konteks:** Menerjemahkan maksud tersembunyi klien (misal: apakah klien sedang marah atau hanya bertanya teknis).
*   **Draf Balasan:** Generator draf pesan yang profesional, persuasif, dan sesuai dengan *tone* internasional.
*   **Simulasi:** Simulasi negosiasi harga sebelum *chat* langsung dengan klien.

### D. Personal Dashboard
*   **Monitoring:** Visualisasi *funnel* pekerjaan (Applied -> Interview -> In-Progress -> Paid).
*   **API Management:** Form input untuk memasukkan API Key (OpenAI/Anthropic) agar biaya penggunaan terkontrol.

---

## 4. KEBUTUHAN NON-FUNGSIONAL

*   **Performa:** *Load time* dashboard < 2 detik. Proses AI (inferensi) diselesaikan dalam < 10 detik.
*   **Keamanan:** Data klien tidak disimpan secara permanen di database aplikasi (hanya *session-based*). API Key pengguna dienkripsi dengan standar AES-256.
*   **Skalabilitas:** Arsitektur *Serverless* agar tidak perlu mengelola *server* fisik/VPS yang kompleks.

---

## 5. REKOMENDASI STACK TEKNOLOGI

| Komponen | Teknologi | Alasan |
| :--- | :--- | :--- |
| **Frontend** | Next.js + Tailwind CSS | Responsif, SEO friendly, cepat untuk dashboard. |
| **Backend** | Supabase (PostgreSQL) | *Backend-as-a-Service*, mudah untuk database & otentikasi. |
| **AI Engine** | OpenAI API (GPT-4o) | Kualitas penalaran terbaik untuk panduan teknis. |
| **Scraping** | Apify | Solusi *managed-scraping* agar tidak kena *block* IP. |
| **Hosting** | Vercel | *Deployment* instan, tanpa perlu konfigurasi server. |

---

## 6. TIMELINE & ROADMAP EKSEKUSI (MVP)

> **Fase Fokus: 8 Minggu Pengembangan**

*   **Minggu 1-2 (Perancangan):** Desain UI/UX (Figma), *setup* database Supabase, dan riset API target situs freelance.
*   **Minggu 3-6 (Pengembangan):**
    *   *Minggu 3-4:* Integrasi Scraper & Filter AI.
    *   *Minggu 5:* Integrasi API AI untuk Mentor & Komunikasi.
    *   *Minggu 6:* Membangun Dashboard & koneksi ke database.
*   **Minggu 7 (QA/Testing):** *User Acceptance Testing* (UAT), perbaikan bug, dan optimasi *prompt* AI.
*   **Minggu 8 (Launch):** *Deployment* ke Vercel dan integrasi notifikasi ke Telegram.

---
*Dokumen ini bersifat rahasia dan merupakan panduan teknis utama untuk pengembangan proyek "freelencerjob".*