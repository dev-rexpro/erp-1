import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { prompt, model = 'mistral-7b' } = req.body || {}

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const q = prompt.toLowerCase()
  let richResponse = ''

  if (q.includes('cargill') || q.includes('krakatau') || q.includes('overdue') || q.includes('invoice') || q.includes('tagihan')) {
    richResponse = `Berikut adalah rincian tagihan invoice yang terverifikasi overdue dan memerlukan tindakan segera:

1. **INV-2026-1002** — Cargill Inc
   - **Nominal**: $47,200.00
   - **Jatuh Tempo**: 25 Juli 2026 (Overdue 11 Hari)
   - **Layanan**: FCL 40HC Freight (Jakarta → Shanghai)

2. **INV-2026-1001** — PT Krakatau Steel (Persero) Tbk
   - **Nominal**: $35,800.00
   - **Jatuh Tempo**: 25 Juli 2026 (Overdue 11 Hari)
   - **Layanan**: Custom Clearance & Ocean Freight

**Rekomendasi Tindakan:**
Saya dapat membantu mengirimkan email Payment Reminder & Tax Invoice ke Budi Santoso (budi.s@rexcorp.cloud) dari tim AR Finance mengenai hal ini jika Anda berkenan.`
  } else if (q.includes('shipment') || q.includes('container') || q.includes('shanghai') || q.includes('track') || q.includes('lacak')) {
    richResponse = `Berdasarkan data pelacakan kontainer terkini:

- **Kontainer Ref**: OOLU2800014 (SHP-2026-1001)
- **Vessel**: OOCL INDONESIA (V204E)
- **Client**: PT Krakatau Steel
- **Rute**: Jakarta (IDJKT) → Shanghai (CNSHA)
- **Posisi Terakhir**: Selat Malaka (In Transit)
- **Status Progress**: 65% (ETA: 05 Agustus 2026 - Penundaan 2 hari akibat cuaca)

**Rekomendasi Tindakan:**
Saya dapat membantu mengirimkan email konfirmasi revisi ETA ke Hendra Tan - OOCL Care (hendra.tan@oocl.com) mengenai hal ini jika Anda berkenan.`
  } else if (q.includes('ceisa') || q.includes('pib') || q.includes('peb') || q.includes('hold') || q.includes('cukai')) {
    richResponse = `Berdasarkan verifikasi dokumen Bea Cukai CEISA 4.0:

- **Dokumen**: PIB-2026-0400 (PT Krakatau Steel)
- **Status**: **HOLD / UNDER REVIEW**
- **Pelabuhan**: Tanjung Priok Port
- **Catatan Petugas BC**: "Mismatch HS Code — declared 8471.30 vs tariff 8473.30"

**Rekomendasi Tindakan:**
Saya dapat membantu mengirimkan email pemberitahuan ke Risa Amelia (risa.amelia@rexcorp.cloud) dari tim Dokumen Impor mengenai hal ini jika Anda berkenan.`
  } else if (q.includes('rate') || q.includes('harga') || q.includes('freight') || q.includes('ongkir')) {
    richResponse = `Berikut perbandingan freight rate terkini untuk rute Jakarta → Shanghai (40HC):

1. **OOCL (Service AEX5)**: **$1,450 / 40HC** (Transit: 10 Hari, Schedule: 04 Aug) — *Rekomendasi Best Value!*
2. **Maersk (Service AE-1)**: **$1,580 / 40HC** (Transit: 10 Hari, Schedule: 03 Aug)
3. **MSC (Service JADE)**: **$1,320 / 40HC** (Transit: 12 Hari, Schedule: 06 Aug)`
  } else {
    richResponse = `Berdasarkan analisis data sistem ERP One untuk "${prompt}":

- **Status Data**: Seluruh entitas modul (Shipment, Invoicing, CEISA Declarations, dan Duty Tariffs) beroperasi normal.
- **Rekomendasi**: Anda dapat meninjau rincian lebih lanjut di modul terkait atau meminta tindakan spesifik dari Masbro AI.`
  }

  return res.status(200).json({
    success: true,
    model,
    prompt,
    response: richResponse,
    source: 'vercel_serverless_cortex',
  })
}
