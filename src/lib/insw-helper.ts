import https from 'https'

const INSW_SEARCH_URL = 'https://api.insw.go.id/api/cms/hscode'
const INSW_DETAIL_URL = 'https://api.insw.go.id/api/cms/detail-komoditas'

let cachedToken =
  process.env.INSW_TOKEN ||
  'Basic eyJhbGciOiJSUzI1NiIsInR5cCI6ImJzYStqd3QiLCJraWQiOiJrSTVvYXd3bmR5SFNTOEpOVkJCSm1DVlQ2UjlHSmxhaHRsYmZiR2NHa3J3In0.eyJpc3MiOiJodHRwczovL3d3dy5pbnN3LmdvLmlkIiwiaWF0IjoxNzE2ODg0MDAwLCJleHAiOjE5MDU0ODQwMDB9.sample'

let isRefreshing = false

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

export async function getInswToken(): Promise<string> {
  if (cachedToken && !cachedToken.includes('sample')) {
    return cachedToken
  }

  if (isRefreshing) return cachedToken
  isRefreshing = true

  try {
    const res = await fetch('https://www.insw.go.id/hs-code', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
    const html = await res.text()

    // Match JWT pattern in page scripts/html
    const jwtMatches = html.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g)
    if (jwtMatches && jwtMatches.length > 0) {
      cachedToken = jwtMatches[0].startsWith('Basic ') ? jwtMatches[0] : `Basic ${jwtMatches[0]}`
      console.log('✅ Light INSW Token extracted successfully')
    }
  } catch (err: any) {
    console.warn('⚠️ Light token fetch fallback:', err.message)
  } finally {
    isRefreshing = false
  }

  return cachedToken
}

export function getInswHeaders(token: string) {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
    Authorization: token.startsWith('Basic ') ? token : `Basic ${token}`,
    Referer: 'https://www.insw.go.id/hs-code',
    Origin: 'https://www.insw.go.id',
  }
}

export async function fetchInswSearch(keyword: string, size = 10, page = 0) {
  const token = await getInswToken()
  const fromOffset = page * size
  const targetUrl = `${INSW_SEARCH_URL}?keyword=${encodeURIComponent(keyword)}&size=${size}&from=${fromOffset}`

  const response = await fetch(targetUrl, {
    headers: getInswHeaders(token),
    // @ts-ignore
    agent: httpsAgent,
  })

  if (response.status === 401) {
    // Retry once with refreshed token
    cachedToken = ''
    const freshToken = await getInswToken()
    const retryRes = await fetch(targetUrl, {
      headers: getInswHeaders(freshToken),
      // @ts-ignore
      agent: httpsAgent,
    })
    return await retryRes.json()
  }

  return await response.json()
}

export async function fetchInswDetail(hsCode: string) {
  const token = await getInswToken()
  const targetUrl = `${INSW_DETAIL_URL}?hsCode=${encodeURIComponent(hsCode)}`

  const response = await fetch(targetUrl, {
    headers: getInswHeaders(token),
    // @ts-ignore
    agent: httpsAgent,
  })

  if (response.status === 401) {
    cachedToken = ''
    const freshToken = await getInswToken()
    const retryRes = await fetch(targetUrl, {
      headers: getInswHeaders(freshToken),
      // @ts-ignore
      agent: httpsAgent,
    })
    return await retryRes.json()
  }

  return await response.json()
}
