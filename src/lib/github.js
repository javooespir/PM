const shaCache = {}

function b64encode(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj, null, 2))
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

function b64decode(b64) {
  const binary = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

function apiUrl(auth, path) {
  return `https://api.github.com/repos/${auth.owner}/${auth.repo}/contents/${path}`
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

export async function readFile(path, auth) {
  const res = await fetch(`${apiUrl(auth, path)}?ref=${auth.branch || 'main'}`, {
    headers: headers(auth.token),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GitHub read error ${res.status}: ${path}`)
  const data = await res.json()
  shaCache[`${auth.owner}/${auth.repo}/${path}`] = data.sha
  return b64decode(data.content)
}

export async function writeFile(path, content, auth) {
  const branch = auth.branch || 'main'
  const cacheKey = `${auth.owner}/${auth.repo}/${path}`

  let sha = shaCache[cacheKey]
  if (!sha) {
    const res = await fetch(`${apiUrl(auth, path)}?ref=${branch}`, {
      headers: headers(auth.token),
    })
    if (res.ok) {
      const data = await res.json()
      sha = data.sha
      shaCache[cacheKey] = sha
    }
  }

  const body = {
    message: `PM Control Tower: update ${path}`,
    content: b64encode(content),
    branch,
    ...(sha ? { sha } : {}),
  }

  const res = await fetch(apiUrl(auth, path), {
    method: 'PUT',
    headers: headers(auth.token),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub write error ${res.status}: ${err.message || path}`)
  }

  const data = await res.json()
  shaCache[cacheKey] = data.content.sha
  return data
}

export async function validateAuth(auth) {
  const res = await fetch(`https://api.github.com/repos/${auth.owner}/${auth.repo}`, {
    headers: headers(auth.token),
  })
  return res.ok
}
