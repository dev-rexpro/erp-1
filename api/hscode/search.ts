import type { VercelRequest, VercelResponse } from '@vercel/node'
import { fetchInswSearch } from '../../src/lib/insw-helper'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
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

  const keyword = (req.query.keyword as string) || ''
  const size = parseInt((req.query.size as string) || '10', 10)
  const page = parseInt((req.query.page as string) || '0', 10)

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword parameter is required' })
  }

  try {
    const data = await fetchInswSearch(keyword, size, page)
    return res.status(200).json(data)
  } catch (error: any) {
    console.error('Vercel INSW Search API Error:', error.message)
    return res.status(500).json({ error: 'Failed to search HS Code from INSW' })
  }
}
