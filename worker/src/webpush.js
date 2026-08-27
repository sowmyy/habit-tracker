// Web Push (RFC 8291 aes128gcm) + VAPID (RFC 8292) implemented with Web Crypto
// so it runs on the Cloudflare Workers runtime (no Node crypto / no deps).

const enc = new TextEncoder()

function b64urlToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0
  const bin = atob(s + '='.repeat(pad))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
function bytesToB64url(bytes) {
  let bin = ''
  const b = new Uint8Array(bytes)
  for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function concat(...arrs) {
  const total = arrs.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let o = 0
  for (const a of arrs) {
    out.set(a, o)
    o += a.length
  }
  return out
}

// ---- VAPID JWT (ES256) ----
async function vapidAuthHeader(endpoint, vapidPublicKey, vapidPrivateKey, subject) {
  const aud = new URL(endpoint).origin
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  }
  const signingInput =
    bytesToB64url(enc.encode(JSON.stringify(header))) +
    '.' +
    bytesToB64url(enc.encode(JSON.stringify(payload)))

  const pub = b64urlToBytes(vapidPublicKey) // 65 bytes uncompressed (0x04||X||Y)
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    d: vapidPrivateKey,
    ext: true,
  }
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    enc.encode(signingInput)
  )
  const jwt = signingInput + '.' + bytesToB64url(new Uint8Array(sig))
  return { Authorization: `vapid t=${jwt}, k=${vapidPublicKey}` }
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    key,
    length * 8
  )
  return new Uint8Array(bits)
}

// ---- Encrypt the payload for one subscription (aes128gcm) ----
async function encryptPayload(subscription, plaintext) {
  const uaPublic = b64urlToBytes(subscription.keys.p256dh) // 65 bytes
  const authSecret = b64urlToBytes(subscription.keys.auth) // 16 bytes

  // Ephemeral (application server) ECDH keypair
  const asKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
  const asPublicRaw = new Uint8Array(await crypto.subtle.exportKey('raw', asKeyPair.publicKey)) // 65

  const uaKey = await crypto.subtle.importKey(
    'raw',
    uaPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
  const ecdhBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaKey },
    asKeyPair.privateKey,
    256
  )
  const ecdhSecret = new Uint8Array(ecdhBits)

  // IKM = HKDF(salt=authSecret, ikm=ecdhSecret, info="WebPush: info\0"||ua||as, 32)
  const keyInfo = concat(enc.encode('WebPush: info\0'), uaPublic, asPublicRaw)
  const ikm = await hkdf(authSecret, ecdhSecret, keyInfo, 32)

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12)

  const aesKey = await crypto.subtle.importKey('raw', cek, { name: 'AES-GCM' }, false, ['encrypt'])
  // Single record: plaintext || 0x02 delimiter
  const record = concat(new Uint8Array(plaintext), new Uint8Array([2]))
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, aesKey, record)
  )

  // aes128gcm content-coding header: salt(16) || rs(4) || idlen(1) || keyid(as public 65)
  const rs = new Uint8Array([0, 0, 0x10, 0]) // record size 4096
  const idlen = new Uint8Array([asPublicRaw.length])
  return concat(salt, rs, idlen, asPublicRaw, ciphertext)
}

// Send a push. Returns the fetch Response (caller checks status: 201 ok, 404/410 = gone).
export async function sendPush(subscription, payloadObj, vapid) {
  const body = await encryptPayload(subscription, enc.encode(JSON.stringify(payloadObj)))
  const auth = await vapidAuthHeader(
    subscription.endpoint,
    vapid.publicKey,
    vapid.privateKey,
    vapid.subject
  )
  return fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      ...auth,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '86400',
      Urgency: 'normal',
    },
    body,
  })
}
