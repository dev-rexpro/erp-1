import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const { prompt = '', model = 'mistral-7b' } = req.body || {}

  const sql = `SELECT SNOWFLAKE.CORTEX.COMPLETE('${model}', '${String(prompt).replace(/'/g, "''")}');`

  return res.json({
    success: true,
    model,
    prompt,
    sql,
    response: `[VERCEL SERVERLESS / DEMO MODE]\nBerdasarkan query database Snowflake ERP_ONE_DB, request "${prompt}" telah diproses via Cortex AI (${model}).`,
    source: 'cortex_vercel_serverless',
  })
}
