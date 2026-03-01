/**
 * CF Worker — Unlock Protocol key checker
 * 
 * GET /api/check?address=0x...
 * → { valid: bool, expiration: number, tokenId: number|null }
 * 
 * Верифицирует Privy JWT + проверяет наличие валидного ключа на lock
 * 
 * Env vars (wrangler.toml или CF dashboard):
 *   PRIVY_APP_ID      — твой Privy App ID
 *   LOCK_ADDRESS      — адрес Unlock lock контракта
 *   CHAIN_ID          — 8453 (Base)
 *   RPC_URL           — https://mainnet.base.org
 *   ALLOWED_ORIGIN    — https://твой-домен.pages.dev
 */

const LOCK_ABI_KEY_EXPIRATION = '0x9d76ea58' // keyExpirationTimestampFor(uint256)
const LOCK_ABI_OWNER_OF       = '0x6352211e' // ownerOf(uint256)

export default {
  async fetch(request, env) {
    // CORS
    const origin = request.headers.get('Origin') || ''
    const allowed = env.ALLOWED_ORIGIN || '*'
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const rlKey = `rl:${ip}`
    const hits = parseInt(await env.RATE_LIMIT.get(rlKey) || '0')
    if (hits >= 10) return json({ error: 'too many requests' }, 429, corsHeaders)
    await env.RATE_LIMIT.put(rlKey, String(hits + 1), { expirationTtl: 60 })



    const url = new URL(request.url)

    // ── GET /api/check?address=0x... ─────────────────────────────────────────
    if (url.pathname === '/api/check') {
      try {
        // 1. Верифицировать Privy JWT
        const authHeader = request.headers.get('Authorization') || ''
        const token = authHeader.replace('Bearer ', '')
        if (!token) return json({ error: 'no token' }, 401, corsHeaders)

        const payload = await verifyPrivyJwt(token, env.PRIVY_APP_ID)
        if (!payload) return json({ error: 'invalid token' }, 401, corsHeaders)

        // 2. Получить wallet адрес — из query param или из Privy JWT
        let address = url.searchParams.get('address') || ''
        
        // Если адрес не передан — берём из JWT (linkedAccounts)
        // Privy кодирует wallet в sub или в кастомных claims
        if (!address && payload.sub) {
          // sub = "did:privy:xxx" — это DID, не адрес
          // wallet должен приходить с фронтенда из useWallets()
          return json({ error: 'address required' }, 400, corsHeaders)
        }

        address = address.toLowerCase()
        if (!address.match(/^0x[0-9a-f]{40}$/)) {
          return json({ error: 'invalid address' }, 400, corsHeaders)
        }

        // 3. Найти валидный токен для адреса на lock
        const locks = env.LOCK_ADDRESS.split(',').map(a => a.trim())
        let result = { valid: false }

        for (const lock of locks) {
          result = await checkUnlockAccess(address, lock, env.RPC_URL, parseInt(env.MAX_TOKEN_ID || '200'))
          if (result.valid) break
        }
        return json(result, result.valid ? 200 : 403, corsHeaders)

      } catch (e) {
        return json({ error: e.message }, 500, corsHeaders)
      }
    }

    return json({ error: 'not found' }, 404, corsHeaders)
  }
}

// ── Verify Privy JWT (RS256) ─────────────────────────────────────────────────
async function verifyPrivyJwt(token, appId) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) { console.log('bad parts'); return null }

    const jwksRes = await fetch(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
    if (!jwksRes.ok) { console.log('jwks fetch failed', jwksRes.status); return null }
    const { keys } = await jwksRes.json()

    const header = JSON.parse(atob(parts[0]))
    const jwk = keys.find(k => k.kid === header.kid) || keys[0]
    if (!jwk) { console.log('no jwk found'); return null }

    const key = await crypto.subtle.importKey(
        'jwk', jwk,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, ['verify']
    )

    const data = new TextEncoder().encode(parts[0] + '.' + parts[1])
    const sig = base64urlDecode(parts[2])
    const valid = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, sig, data)
    if (!valid) { console.log('bad signature'); return null }

    const payload = JSON.parse(atob(parts[1]))
    console.log('payload', JSON.stringify(payload))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) { console.log('expired'); return null }
    if (payload.iss !== 'privy.io') { console.log('bad iss', payload.iss); return null }
    if (payload.aud && payload.aud !== appId) { console.log('bad aud', payload.aud, appId); return null }

    return payload
  } catch(e) { console.log('verify error', e.message); return null }
}
// ── Check Unlock Protocol access ─────────────────────────────────────────────
async function checkUnlockAccess(address, lockAddress, rpcUrl, maxTokenId = 200) {
  console.log('checking', address, 'on lock', lockAddress, 'rpc', rpcUrl)
  const now = Math.floor(Date.now() / 1000)

  // Перебираем tokenId от 1 до maxTokenId
  // В реальном продакшене лучше использовать Unlock Subgraph для скорости
  // но для курса с небольшим числом студентов этого достаточно
  for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
    try {
      // ownerOf(tokenId)
      const owner = await ethCall(rpcUrl, lockAddress, LOCK_ABI_OWNER_OF, tokenId)
      console.log('token', tokenId, 'owner', owner)

      // Если адрес нулевой — токены закончились
      if (owner === '0x0000000000000000000000000000000000000000') break
      
      // Проверяем совпадение владельца
      if (owner.toLowerCase() !== address.toLowerCase()) continue

      // keyExpirationTimestampFor(tokenId)
      const expHex = await ethCallRaw(rpcUrl, lockAddress, LOCK_ABI_KEY_EXPIRATION, tokenId)
      const expiration = parseInt(expHex, 16)
      console.log('token', tokenId, 'expiration', expiration, 'now', Math.floor(Date.now()/1000))

      const valid = expiration === 0 || expiration > now
      return {
        valid,
        tokenId,
        expiration,
        expiresAt: new Date(expiration * 1000).toISOString(),
        address,
        lockAddress,
      }
    } catch {
      // ownerOf на несуществующий tokenId кидает revert — значит токены закончились
      break
    }
  }

  return {
    valid: false,
    tokenId: null,
    expiration: 0,
    address,
    lockAddress,
  }
}

// ── eth_call helpers ─────────────────────────────────────────────────────────
async function ethCall(rpcUrl, to, selector, tokenId) {
  const raw = await ethCallRaw(rpcUrl, to, selector, tokenId)
  // ownerOf возвращает address (последние 20 байт из 32-байтного значения)
  return '0x' + raw.slice(-40)
}

async function ethCallRaw(rpcUrl, to, selector, tokenId) {
  // Кодируем tokenId как uint256 (32 байта, big-endian hex)
  const param = tokenId.toString(16).padStart(64, '0')
  const data = selector + param

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest']
    })
  })

  const { result, error } = await res.json()
  if (error) throw new Error(error.message)
  if (!result || result === '0x') throw new Error('empty result')

  return result.replace('0x', '')
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  })
}

function base64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    str.length + (4 - str.length % 4) % 4, '='
  )
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}
