const initConfig = auth => {
  const missing = []
  if (!auth.issuer) missing.push('issuer')
  if (!auth.client_id) missing.push('client_id')
  if (!auth.redirect_uri) missing.push('redirect_uri')
  if (!auth.scopes) auth.scopes = ['openid']
  if (missing.length) throw new Error(`${missing.join(', ')} must be defined`)
  return auth
}

const getFromUri = () => {
  const path = localStorage.getItem('referrerPath') || '/'
  localStorage.removeItem('referrerPath')
  return path
}

const Utils = {
  initConfig,
  getFromUri
}

export { Utils }
