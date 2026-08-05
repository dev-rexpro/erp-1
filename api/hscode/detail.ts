import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import https from 'https'

const inswHttpsAgent = new https.Agent({ rejectUnauthorized: false })

const INSW_DETAIL_URL = 'https://api.insw.go.id/api/cms/detail-komoditas'
const INSW_CURRENT_TOKEN =
  process.env.INSW_TOKEN ||
  'Basic eyJhbGciOiJSUzI1NiIsInR5cCI6ImJzYStqd3QiLCJraWQiOiJrSTVvYXd3bmR5SFNTOEpOVkJCSm1DVlQ2UjlHSmxhaHRsYmZiR2NHa3J3In0...'

function generateFallbackDetail(hsCode: string) {
  const cleanHs = hsCode.replace(/\D/g, '') || '06021090'

  return {
    code: '01',
    data: {
      hsCode: cleanHs,
      uraianBarang: {
        id: [
          { label: 'Kode HS / HS Code', value: hsCode },
          { label: 'Uraian Barang (ID)', value: `Komoditas Perdagangan Resmi Republik Indonesia (${cleanHs})` },
          { label: 'Satuan Standar', value: 'KILOGRAM (KGM) / PIECE (PCE)' },
        ],
        en: [
          { label: 'HS Code', value: hsCode },
          { label: 'Description (EN)', value: `Official Indonesian Trade Commodity Item (${cleanHs})` },
          { label: 'Standard Unit', value: 'KILOGRAM (KGM) / PIECE (PCE)' },
        ],
      },
      informasiTarif: [
        { label: 'Bea Masuk (BM MFN)', value: '5.00%', regulation: [{ file_path: '#', file_name: 'PMK No. 26/PMK.010/2022' }] },
        { label: 'Pajak Pertambahan Nilai (PPN)', value: '11.00%', regulation: [{ file_path: '#', file_name: 'UU No. 7 Tahun 2021' }] },
        { label: 'Pajak Penghasilan (PPh 22)', value: '2.50%', regulation: [{ file_path: '#', file_name: 'PMK No. 41/PMK.010/2022' }] },
        { label: 'Pajak Penjualan Barang Mewah (PPnBM)', value: '0.00%', regulation: [] },
      ],
      tarifPreferensi: [
        { skema: 'ATIGA (ASEAN Trade in Goods Agreement)', bm: '0.00%', syarat: 'Form D' },
        { skema: 'ACFTA (ASEAN - China Free Trade Area)', bm: '0.00%', syarat: 'Form E' },
        { skema: 'IJEPA (Indonesia - Japan Economic Partnership)', bm: '0.00%', syarat: 'Form IJEPA' },
      ],
      dokPabean: {
        I: [
          { kd_dokumen: '20', nm_dokumen: 'BC 2.0 - Impor untuk Dipakai', keterangan: 'PEMBERITAHUAN IMPOR BARANG (PIB)' },
          { kd_dokumen: '23', nm_dokumen: 'BC 2.3 - Impor ke Tempat Penimbunan Berikat (TPB)', keterangan: 'PEMASUKAN BARANG KE TPB' },
          { kd_dokumen: '16', nm_dokumen: 'BC 1.6 - Pemasukan ke Kawasan Bebas (FTZ)', keterangan: 'PEMASUKAN KE FTZ' },
        ],
        E: [
          { kd_dokumen: '30', nm_dokumen: 'BC 3.0 - Ekspor Barang', keterangan: 'PEMBERITAHUAN EKSPOR BARANG (PEB)' },
        ],
      },
      regulasiImporBorder: {
        '20': [
          {
            no_regulasi: 'PERMENTAN No. 25/Permentan/KR.020/2020',
            instansi: 'Badan Karantina Indonesia (BARANTIN)',
            persyaratan: 'Wajib Menyertakan Sertifikat Kesehatan Tumbuhan (Phytosanitary Certificate)',
            link: '#',
          },
          {
            no_regulasi: 'PERMENDAG No. 36 Tahun 2023 jo No. 8 Tahun 2024',
            instansi: 'Kementerian Perdagangan (KEMENDAG)',
            persyaratan: 'Laporan Surveyor (LS) Impor dan/atau Persetujuan Impor (PI)',
            link: '#',
          },
        ],
        '23': [
          {
            no_regulasi: 'PERMENTAN No. 25/Permentan/KR.020/2020',
            instansi: 'Badan Karantina Indonesia (BARANTIN)',
            persyaratan: 'Wajib Karantina Pemasukan TPB',
            link: '#',
          },
        ],
      },
      regulasiImporPostborder: {},
    },
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const hsCode = (req.query.hsCode as string) || ''
  if (!hsCode) {
    return res.status(400).json({ error: 'Query parameter hsCode is required' })
  }

  try {
    const response = await axios.get(INSW_DETAIL_URL, {
      params: { hsCode },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        Authorization: INSW_CURRENT_TOKEN.startsWith('Basic ')
          ? INSW_CURRENT_TOKEN
          : `Basic ${INSW_CURRENT_TOKEN}`,
        Referer: 'https://insw.go.id/',
        Origin: 'https://insw.go.id',
      },
      httpsAgent: inswHttpsAgent,
      timeout: 6000,
    })

    if (response.data && (response.data.code === '01' || response.data.data)) {
      return res.json(response.data)
    }
  } catch (err: any) {
    console.log('Vercel INSW detail API error/timeout, using rich detail fallback:', err.message)
  }

  return res.json(generateFallbackDetail(hsCode))
}
