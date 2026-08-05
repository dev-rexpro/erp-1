# Copilot Instructions — ERP One

Baca file ini dulu sebelum mengerjakan task apapun di repo ini. Ikuti prinsip dan urutan kerja di bawah, jangan improvisasi struktur di luar ini tanpa konfirmasi ke user.

## Konteks Project

ERP One: dashboard ERP modular berbasis React + Vite + TypeScript + TanStack Router + ShadcnUI (Tailwind + Radix). Saat ini berisi 10+ halaman yang masing-masing dibangun manual/hardcoded (list table, form, layout semua ditulis ulang per halaman) sehingga tidak konsisten satu sama lain.

Tujuan: ubah menjadi **metadata-driven** — satu definisi schema per resource/entity men-generate List View, Form View, dan Detail View secara otomatis lewat komponen generic. Referensi konsep: DocType di Frappe/ERPNext (satu definisi field → form, table, validasi, permission sekaligus).

Modul yang jadi prioritas refactor saat ini (dipakai nyata untuk perusahaan kecil milik user, bidang **ekspor-impor & freight forwarding**):
- Company / partner terkait ekspor-impor (eksportir, importir, agen, shipping line, dsb.)
- Freight forwarding — shipment, dokumen pengiriman (misal: Bill of Lading, Packing List, Invoice ekspor), tracking status.

## Prinsip kerja (WAJIB diikuti)

1. **Jangan sentuh** layout shell, sidebar shell, theming, komponen shadcn dasar yang sudah ada dan konsisten. Fokus HANYA pada halaman/module list-form-detail yang jadi target refactor.
2. **Migrasi satu modul dulu sebagai proof of concept**, jangan rewrite semua modul sekaligus. Selesaikan satu modul penuh (list, form, detail) sebelum lanjut ke modul berikutnya.
3. Setiap kali menambah entity/modul baru ke depannya, developer HANYA perlu menulis satu file schema — bukan bikin page baru dari nol. Jika sebuah task terasa perlu "bikin page baru", itu tanda salah pendekatan; cek dulu apakah bisa lewat schema + komponen generic yang sudah ada.
4. Tanya ke user dulu sebelum mengubah struktur folder besar-besaran atau menghapus file page lama — ganti page lama ke versi generic secara bertahap per modul, sambil page lama masih bisa dibandingkan.

## Struktur yang harus dibangun

### 1. Tipe schema (`src/lib/resource-schema.ts`)
```ts
type FieldType =
  | "text" | "textarea" | "number" | "currency"
  | "date" | "datetime" | "boolean"
  | "select" | "multiselect"
  | "relation"   // FK ke resource lain (mis. shipment -> company)
  | "table";     // nested rows / child table (mis. daftar barang dalam shipment)

interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  showInList?: boolean;
  showInForm?: boolean;
  options?: string[];
  relationTo?: string;      // nama resource lain, untuk type "relation"
  validation?: ZodTypeAny;  // pakai zod
}

interface ResourceSchema {
  name: string;
  label: string;
  module: string;   // grouping untuk sidebar, mis. "export-import" atau "freight"
  fields: FieldSchema[];
  defaultSort?: string;
}
```

### 2. Registry schema per resource (`src/resources/*.schema.ts`)
Contoh entity awal yang perlu didefinisikan untuk modul ekspor-impor & freight forwarding:
- `resources/company.schema.ts` — partner bisnis (eksportir/importir/agen/shipping line), field seperti nama, jenis partner, kontak, negara.
- `resources/shipment.schema.ts` — data pengiriman freight forwarding: nomor shipment, company (relation), origin, destination, tanggal berangkat/tiba, status, dokumen terkait.

### 3. Komponen generic (`src/components/resource/`)
- `ResourceListView.tsx` — pakai TanStack Table / UI table. Kolom digenerate dari `schema.fields.filter(f => f.showInList)`.
- `ResourceFormView.tsx` — pakai react-hook-form + zod. Mapping tipe field ke komponen input shadcn.
- `ResourceDetailView.tsx` — read-only layout, field sama, urutan sama seperti form.

### 4. Sidebar/navigasi
Generate daftar menu dari registry resource + module (bukan hardcoded di komponen Sidebar), supaya nambah modul baru otomatis muncul di nav.
