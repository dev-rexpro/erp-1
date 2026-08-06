import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchInswDetail } from '../../src/lib/insw-helper'

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

  const hsCode = (req.query.hsCode as string) || ''

  if (!hsCode) {
    return res.status(400).json({ error: 'hsCode parameter is required' })
  }

  try {
    const data = await fetchInswDetail(hsCode)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Vercel INSW Detail API Error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch HS Code details from INSW' })
  }
}
