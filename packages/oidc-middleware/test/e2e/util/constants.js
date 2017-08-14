const PORT = process.env.PORT || 3000;
const BASE_URI = process.env.BASE_URI || `http://localhost:${PORT}`;

module.exports = {
  REDIRECT_URI: `${BASE_URI}/authorization-code/callback`,
  LOGIN_PATH: `${BASE_URI}/login`,
  LOGOUT_PATH: `${BASE_URI}/logout`,
  PROTECTED_PATH: `${BASE_URI}/protected`,
  ISSUER: process.env.ISSUER,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  USERNAME: process.env.USERNAME,
  PASSWORD: process.env.PASSWORD,
  PORT,
  BASE_URI
}
