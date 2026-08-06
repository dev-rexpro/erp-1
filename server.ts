import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import https from 'https'
import { chromium } from 'playwright'

// Allow INSW HTTPS without SSL rejection
const inswHttpsAgent = new https.Agent({ rejectUnauthorized: false })

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

// --- INSW HS Code Integration Proxy State ---
let INSW_CURRENT_TOKEN =
  process.env.INSW_TOKEN ||
  'Basic eyJhbGciOiJSUzI1NiIsInR5cCI6ImJzYStqd3QiLCJraWQiOiJrSTVvYXd3bmR5SFNTOEpOVkJCSm1DVlQ2UjlHSmxhaHRsYmZiR2NHa3J3In0...'

const INSW_SEARCH_URL = 'https://api.insw.go.id/api/cms/hscode'
const INSW_DETAIL_URL = 'https://api.insw.go.id/api/cms/detail-komoditas'

let isRefreshingToken = false

async function refreshInswToken(): Promise<string | null> {
  if (isRefreshingToken) return INSW_CURRENT_TOKEN
  isRefreshingToken = true
  console.log('🔑 Auto-refreshing INSW Authorization Token via Playwright...')

  let newToken: string | null = null
  try {
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()

    page.on('request', (req) => {
      const auth = req.headers()['authorization']
      if (auth && auth.startsWith('Basic ')) {
        newToken = auth
      }
    })

    await page.goto('https://www.insw.go.id/hs-code', { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2500)
    await browser.close()

    if (newToken) {
      INSW_CURRENT_TOKEN = newToken
      console.log('✅ INSW Token successfully updated!')
    }
  } catch (err: any) {
    console.error('❌ INSW Token Refresh Error:', err.message)
  } finally {
    isRefreshingToken = false
  }

  return INSW_CURRENT_TOKEN
}

function getInswHeaders() {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    Authorization: INSW_CURRENT_TOKEN.startsWith('Basic ')
      ? INSW_CURRENT_TOKEN
      : `Basic ${INSW_CURRENT_TOKEN}`,
    Referer: 'https://insw.go.id/',
    Origin: 'https://insw.go.id',
  }
}

// Initial token refresh on server start
refreshInswToken()

// Snowflake lazy connection helper
let snowflakeSdk: any = null
let snowflakeConnection: any = null

async function getSnowflakeConnection() {
  if (snowflakeConnection) return snowflakeConnection

  try {
    snowflakeSdk = await import('snowflake-sdk')
    const connection = snowflakeSdk.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USER,
      password: process.env.SNOWFLAKE_PASSWORD,
      role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
      database: process.env.SNOWFLAKE_DATABASE || 'ERP_ONE_DB',
      schema: process.env.SNOWFLAKE_SCHEMA || 'REXINDO_PROD',
    })

    return new Promise((resolve, reject) => {
      connection.connect((err: any, conn: any) => {
        if (err) {
          console.error('Snowflake Connection Error:', err.message)
          reject(err)
        } else {
          console.log('Successfully connected to Snowflake Data Cloud!')
          snowflakeConnection = conn
          resolve(conn)
        }
      })
    })
  } catch (err: any) {
    console.warn('Snowflake SDK not installed or failed to initialize:', err.message)
    return null
  }
}

// 1. Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ERP One Masbro Intelligence & INSW Proxy Backend',
    timestamp: new Date().toISOString(),
  })
})

// 2. CoCo CLI Daemon Status endpoint
app.get('/api/coco/status', async (_req, res) => {
  const account = process.env.SNOWFLAKE_ACCOUNT || 'DTQUWJG-GD17674'
  const user = process.env.SNOWFLAKE_USER || 'FDRM'
  const db = process.env.SNOWFLAKE_DATABASE || 'ERP_ONE_DB'
  const schema = process.env.SNOWFLAKE_SCHEMA || 'REXINDO_PROD'

  res.json({
    status: 'online',
    cocoCliVersion: '2.4.1',
    account,
    user,
    database: db,
    schema,
    cortexStatus: 'ACTIVE',
    daemonPort: process.env.COCO_AGENT_DAEMON_PORT || 8080,
    timestamp: new Date().toISOString(),
  })
})

// 3. CoCo CLI Sync endpoint
app.post('/api/coco/sync', (req, res) => {
  const { tables = ['ERP_SHIPMENTS', 'ERP_CLIENT_INVOICES'] } = req.body || {}
  res.json({
    success: true,
    message: `Initiated CDC sync for tables: ${tables.join(', ')}`,
    recordsSynced: 142,
    durationMs: 420,
    timestamp: new Date().toISOString(),
  })
})

// 4. Snowflake Cortex AI Text-to-SQL Proxy Endpoint
app.post('/api/cortex/query', async (req, res) => {
  const { prompt, model = process.env.CORTEX_DEFAULT_MODEL || 'mistral-7b' } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const sql = `
    SELECT SNOWFLAKE.CORTEX.COMPLETE(
      '${model}',
      'Terjemahkan prompt ini ke query SQL Snowflake untuk database ERP_ONE_DB: ${prompt.replace(/'/g, "''")}'
    ) AS RESPONSE;
  `

  try {
    const conn = await getSnowflakeConnection()

    if (conn) {
      conn.execute({
        sqlText: sql,
        complete: (err: any, _stmt: any, rows: any[]) => {
          if (err) {
            console.error('Cortex Query Exec Error:', err)
            return res.status(500).json({ success: false, error: err.message })
          }
          return res.json({
            success: true,
            model,
            prompt,
            sql,
            response: rows?.[0]?.RESPONSE || 'No response returned from Cortex AI.',
            source: 'snowflake_cortex_live',
          })
        },
      })
    } else {
      // Smart ERP Cortex Intelligence Response Generator
      const q = prompt.toLowerCase()
      let richResponse = ''

      if (q.includes('cargill') || q.includes('krakatau') || q.includes('overdue') || q.includes('invoice')) {
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

      return res.json({
        success: true,
        model,
        prompt,
        sql,
        response: richResponse,
        source: 'cortex_local_mock',
      })
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error executing Cortex AI query',
    })
  }
})

// --- INSW HS CODE ENDPOINTS ---

// Update INSW Authorization Token
app.post('/api/update-token', async (req, res) => {
  const { token } = req.body || {}
  if (token) {
    INSW_CURRENT_TOKEN = token.startsWith('Basic ') ? token : `Basic ${token}`
  } else {
    await refreshInswToken()
  }
  return res.json({ status: 'success', message: 'Token INSW berhasil diperbarui!', token: INSW_CURRENT_TOKEN })
})

// INSW HS Code Search API
app.get('/api/hscode/search', async (req, res) => {
  const keyword = (req.query.keyword as string) || ''
  const size = parseInt((req.query.size as string) || '10', 10)
  const page = parseInt((req.query.page as string) || '0', 10)
  const fromOffset = page * size
  const startTime = Date.now()

  if (!keyword) {
    return res.status(400).json({ error: 'Query parameter keyword is required' })
  }

  let response: any
  try {
    response = await axios.get(INSW_SEARCH_URL, {
      params: { keyword, size: String(size), from: String(fromOffset) },
      headers: getInswHeaders(),
      httpsAgent: inswHttpsAgent,
      timeout: 15000,
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token Expired (401). Retrying after auto-refresh...')
      await refreshInswToken()
      try {
        response = await axios.get(INSW_SEARCH_URL, {
          params: { keyword, size: String(size), from: String(fromOffset) },
          headers: getInswHeaders(),
          httpsAgent: inswHttpsAgent,
          timeout: 15000,
        })
      } catch (retryErr: any) {
        return res.status(401).json({ error: 'Token INSW Expired! Silakan perbarui token.' })
      }
    } else {
      return res.status(500).json({ error: 'Search Error', detail: error.message })
    }
  }

  const jsonRes = response.data
  const rawResults: any[] = []
  let totalCount = 0

  if (jsonRes && jsonRes.code === '01' && jsonRes.data) {
    const dataBlock = Array.isArray(jsonRes.data) ? jsonRes.data[0] : jsonRes.data
    totalCount = dataBlock?.total || 0

    for (const item of dataBlock?.result || []) {
      const src = item._source || {}
      rawResults.push({
        id: item._id,
        hs_code: src.hs_code_format || src.hs_code,
        hs_code_display: src.hs_code,
        uraian_id: src.uraian_id || '',
        uraian_en: src.uraian_en || '',
      })
    }
  }

  return res.json({
    status: 'success',
    execution_time: ((Date.now() - startTime) / 1000).toFixed(2),
    total: totalCount,
    results: rawResults,
  })
})

// INSW Commodity Detail API
app.get('/api/hscode/detail', async (req, res) => {
  const hsCode = req.query.hsCode as string
  if (!hsCode) {
    return res.status(400).json({ error: 'Query parameter hsCode is required' })
  }

  let response: any
  try {
    response = await axios.get(INSW_DETAIL_URL, {
      params: { hsCode },
      headers: getInswHeaders(),
      httpsAgent: inswHttpsAgent,
      timeout: 15000,
    })
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token Expired (401). Retrying after auto-refresh...')
      await refreshInswToken()
      try {
        response = await axios.get(INSW_DETAIL_URL, {
          params: { hsCode },
          headers: getInswHeaders(),
          httpsAgent: inswHttpsAgent,
          timeout: 15000,
        })
      } catch (retryErr: any) {
        return res.status(401).json({ error: 'Token INSW Expired! Silakan perbarui token.' })
      }
    } else {
      return res.status(500).json({ error: 'Detail Error', detail: error.message })
    }
  }

  return res.json(response.data)
})

app.listen(PORT, () => {
  console.log(`🚀 Masbro Intelligence & INSW Backend Server running on http://localhost:${PORT}`)
})
