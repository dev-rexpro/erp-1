# Panduan Implementasi Snowflake Data Cloud, Cortex AI & CoCo CLI — Masbro Intelligence System

Dokumen ini berisi panduan teknis langkah demi langkah (*step-by-step*) untuk menghubungkan **ERP One Freight Forwarding** dengan **Snowflake Data Cloud**, **Snowflake Cortex AI**, dan **CoCo CLI Runner** sebagai backend *Masbro Intelligence System Agent*.

---

## 📋 Ringkasan Arsitektur

```
[ ERP One UI / Masbro Sidebar ]
             │ (REST / API Prompt)
             ▼
[ Express Server Proxy / CoCo CLI Daemon ]
             │
      ┌──────┴────────────────────────┐
      ▼                               ▼
[ Snowflake Cortex AI ]      [ Snowflake Data Cloud ]
 (Text-to-SQL & Search)       (ERP_ONE_DB.REXINDO_PROD)
```

1. **Snowflake Data Cloud**: Menyimpan data warehouse analytical & operasional ekspor-impor (*Shipments, Client Invoices, Customs Declarations, Vendor Rates*).
2. **Snowflake Cortex AI**: LLM internal Snowflake (`mistral-7b`, `llama3-70b`, `snowflake-arctic`) untuk Text-to-SQL dan analisis sentimen/probabilitas keterlambatan.
3. **CoCo CLI**: Agent runner & daemon untuk mengotomatisasi pipeline sync data (CDC) serta trigger aksi otomatis (*Action Cards* / *Email Reminders*).
4. **Masbro Agent**: Asisten AI interaktif di sidebar UI ERP One yang menampilkan insight, rekomendasi, dan eksekusi instruksi operasional.

---

## ⚙️ 1. Persyaratan & Variabel Lingkungan (`.env`)

Salin file `.env.example` menjadi `.env` dan lengkapi kredensial Snowflake akun Anda:

```bash
cp .env.example .env
```

Isi variabel lingkungan berikut di `.env`:

```env
# Kredensial Snowflake Account
SNOWFLAKE_ACCOUNT=REXPRO_ASEAN.ASIA-SOUTHEAST1
SNOWFLAKE_USER=REXPRO_ADMIN
SNOWFLAKE_PASSWORD=PASSWORD_SNOWFLAKE_ANDA
SNOWFLAKE_ROLE=SYSADMIN
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_DATABASE=ERP_ONE_DB
SNOWFLAKE_SCHEMA=REXINDO_PROD

# Konfigurasi Cortex AI
CORTEX_DEFAULT_MODEL=mistral-7b
CORTEX_SEARCH_SERVICE=ERP_CORTEX_SEARCH_SVC

# Konfigurasi CoCo CLI Daemon
COCO_CLI_PATH=/usr/local/bin/coco
COCO_AGENT_DAEMON_PORT=8080
COCO_AGENT_AUTO_SYNC=true
COCO_SYNC_INTERVAL_SEC=300
```

---

## 🗄️ 2. Langkah 1: Eksekusi Skema Snowflake DDL & DML

File SQL DDL lengkap telah disediakan di repository pada lokasi:
`src/lib/mock-data/snowflake-schema.sql`

### Cara Eksekusi via Snowflake Snowsight Worksheet atau SnowSQL CLI:

1. Buka konsol **Snowsight** Snowflake Anda.
2. Buat **SQL Worksheet** baru.
3. Copy-paste seluruh isi file `src/lib/mock-data/snowflake-schema.sql` dan jalankan (*Run All*).

Skema ini akan membuat:
- **Database**: `ERP_ONE_DB`
- **Schema**: `REXINDO_PROD`
- **Warehouse**: `COMPUTE_WH`
- **Tabel Utama**:
  - `ERP_CLIENTS` (Mitra Eksportir/Importir/Shipping Line)
  - `ERP_SHIPMENTS` (Data Pengiriman Freight)
  - `ERP_CLIENT_INVOICES` (Tagihan & AR)
  - `ERP_CUSTOMS_DECLARATIONS` (Dokumen PIB/PEB CEISA)
  - `ERP_VENDOR_RATES` (Freight Rates Kontainer)
- **Analytical Views**:
  - `V_OVERDUE_SHIPMENTS`: Deteksi otomatis shipment terlambat.
  - `V_AR_AGING`: Rekapitulasi piutang piutang overdue.
  - `V_CUSTOMS_ALERTS`: Peringatan dokumen CEISA berstatus HOLD/Kena Jalur Merah.

---

## 🧠 3. Langkah 2: Setup Snowflake Cortex AI Engine

Aktifkan fungsi **Snowflake Cortex LLM & Search Services** di worksheet Snowflake Anda:

```sql
USE DATABASE ERP_ONE_DB;
USE SCHEMA REXINDO_PROD;

-- 1. Uji Coba Fungsi Text-to-SQL Cortex
SELECT SNOWFLAKE.CORTEX.COMPLETE(
  'mistral-7b',
  'Buatkan SQL query Snowflake untuk mengambil daftar invoice overdue lebih dari 10 hari dari ERP_CLIENT_INVOICES.'
) AS CORTEX_SQL_RESPONSE;

-- 2. Buat Cortex Search Service untuk Dokumen & HS Code
CREATE OR REPLACE CORTEX SEARCH SERVICE ERP_CORTEX_SEARCH_SVC
  ON COMMODITY, HOLD_REASON, OFFICER_NOTE
  ATTRIBUTES CLIENT_NAME, DOC_NUMBER, STATUS
  WAREHOUSE = COMPUTE_WH
  TARGET_LAG = '1 hour'
  AS (
    SELECT DOC_NUMBER, CLIENT_NAME, COMMODITY, HOLD_REASON, OFFICER_NOTE, STATUS
    FROM ERP_CUSTOMS_DECLARATIONS
  );
```

---

## 💻 4. Langkah 3: Konfigurasi & Jalankan CoCo CLI

**CoCo CLI** berfungsi sebagai jembatan antara daemon local/server ERP One dengan Snowflake Data Cloud.

### Instalasii & Login CoCo CLI:
```bash
# 1. Install CoCo CLI (jika belum terinstall)
curl -fsSL https://cli.coco.ai/install.sh | sh

# 2. Authenticate dengan Snowflake
coco login \
  --account REXPRO_ASEAN.ASIA-SOUTHEAST1 \
  --user REXPRO_ADMIN \
  --warehouse COMPUTE_WH \
  --database ERP_ONE_DB \
  --schema REXINDO_PROD

# 3. Verifikasi Status Koneksi
coco status

# 4. Sinkronisasi Data Awal (CDC Data Sync)
coco sync --target=snowflake --tables=ERP_SHIPMENTS,ERP_CLIENT_INVOICES

# 5. Jalankan Masbro Agent Background Runner Daemon
coco agent start --name=masbro --port=8080
```

---

## 🔌 5. Langkah 4: Integrasi Node.js Backend Driver (`server.ts`)

Untuk lingkungan produksi, pasang driver resmi Snowflake Node.js di backend Express:

```bash
npm install snowflake-sdk
```

Tambahkan endpoint proxy Cortex AI pada `server.ts`:

```typescript
import snowflake from 'snowflake-sdk';

const connection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USER,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA,
});

connection.connect((err) => {
  if (err) console.error('Snowflake Connection Error:', err);
  else console.log('Successfully connected to Snowflake Data Cloud');
});

// Endpoint Proxy Cortex AI Text-to-SQL
app.post('/api/cortex/query', async (req, res) => {
  const { prompt, model = 'mistral-7b' } = req.body;
  
  const sql = `
    SELECT SNOWFLAKE.CORTEX.COMPLETE(
      '${model}',
      'Terjemahkan prompt ini ke query SQL Snowflake untuk database ERP_ONE_DB: ${prompt}'
    ) AS RESPONSE;
  `;

  connection.execute({
    sqlText: sql,
    complete: (err, stmt, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, response: rows[0].RESPONSE });
    }
  });
});
```

---

## 🖥️ 6. Langkah 5: Pengujian & Monitoring di Frontend

1. Buka aplikasi ERP One di browser.
2. Navigasikan ke halaman **System Intelligence** (`/system-intelligence`) via sidebar navigation.
3. Di tab **Cortex AI Playground**, masukkan prompt seperti:
   - *"Tampilkan invoice overdue dari Cargill Inc dan Krakatau Steel"*
   - *"Cek status dokumen CEISA yang kena hold"*
   - *"Bandingkan freight rate Jakarta ke Shanghai"*
4. Klik **Exec Cortex** untuk melihat query SQL yang dihasilkan secara real-time dan hasilnya.
5. Buka **Masbro AI Agent** (ikon bot di kanan bawah atau tombol di header) untuk berinteraksi langsung dengan agent cerdas yang merekomendasikan *Action Cards*.

---

## 🔍 Troubleshooting FAQ

| Permasalahan | Penyebab | Solusi |
| :--- | :--- | :--- |
| `Snowflake Connection Error: Incorrect credentials` | Account ID / Password salah | Periksa `SNOWFLAKE_ACCOUNT` di `.env`, pastikan format region sesuai (misal: `ACCOUNT.REGION`). |
| `CORTEX.COMPLETE function not found` | Fitur Cortex belum diaktifkan di region/privilege | Pastikan role Anda memiliki privilege `USAGE` pada fungsi Cortex di Snowflake. |
| `CoCo CLI daemon port 8080 blocked` | Port 8080 sedang digunakan process lain | Ubah `COCO_AGENT_DAEMON_PORT=8081` di `.env` dan jalankan `coco agent start --port=8081`. |
