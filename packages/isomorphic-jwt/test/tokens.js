const oneLineTrim = require('common-tags').oneLineTrim;

const tokens = module.exports;

tokens.unicodeToken = oneLineTrim`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAibXNn
  X2VuIjogIkhlbGxvIiwKICAibXNnX2pwIjogIuOBk-OCk-OBq-OBoeOBryIsCiAgIm1zZ19jbiI6I
  CLkvaDlpb0iLAogICJtc2dfa3IiOiAi7JWI64WV7ZWY7IS47JqUIiwKICAibXNnX3J1IjogItCX0L
  TRgNCw0LLRgdGC0LLRg9C50YLQtSEiLAogICJtc2dfZGUiOiAiR3LDvMOfIEdvdHQiIH0.TJVA95O
  rM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ`;

tokens.unicodeClaims = {
  'msg_en': 'Hello',
  'msg_jp': 'こんにちは',
  'msg_cn': '你好',
  'msg_kr': '안녕하세요',
  'msg_ru': 'Здравствуйте!',
  'msg_de': 'Grüß Gott'
};

tokens.malformedHeader = 'BAD.eyJhIjoiYiJ9.WACuDR_AlXngagNOa90c92xbWXYT6vHzn-OUQJl93a8';
tokens.malformedPayload = 'eyJhbGciOiJub25lIn0.BAD.WACuDR_AlXngagNOa90c92xbWXYT6vHzn-OUQJl93a8';
tokens.noAlgInHeader = 'e30=.eyJhIjoiYiJ9.DRwcShm-M7fOQcRhdmtqzzuiNPsv2tAnkV2gfnDMmM0';
tokens.algIsNone = 'eyJhbGciOiJub25lIn0.eyJhIjoiYiJ9.WACuDR_AlXngagNOa90c92xbWXYT6vHzn-OUQJl93a8';

tokens.standardPayload = {
  a: 'b'
};

tokens.RS256token = oneLineTrim`
  eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYiJ9.0rXhRx-Dtqs_EICINM_hOci-6OkvDlss0FvtOwdkyEy
  82yYNJdjxSyNWOPdRnwiHrWp-vL-He-ul6xm7BtZ-tQnbZnU2QlT2nRTciOlt9_x7PVE1SnZVzMbc
  8PYoc49ipbLsmjjqrIpvGP-le1vctXsw2zg5IbMCEBkIH20Kc1U`;

tokens.RS256invalidToken = oneLineTrim`
  eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYyJ9.0rXhRx-Dtqs_EICINM_hOci-6OkvDlss0FvtOwdkyEy
  82yYNJdjxSyNWOPdRnwiHrWp-vL-He-ul6xm7BtZ-tQnbZnU2QlT2nRTciOlt9_x7PVE1SnZVzMbc
  8PYoc49ipbLsmjjqrIpvGP-le1vctXsw2zg5IbMCEBkIH20Kc1U`;

tokens.RS256key = {
  alg: 'RS256',
  kty: 'RSA',
  n: '3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78FAFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8' +
    'yhOKlvoyvsUFPWtNxlJyh5JJXvkNKV_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs',
  e: 'AQAB',
  use: 'sig',
  kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
};

tokens.standardToken = tokens.RS256token;

tokens.standardKey = {
  alg: 'RS256',
  kty: 'RSA',
  n: '3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78FAFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8' +
    'yhOKlvoyvsUFPWtNxlJyh5JJXvkNKV_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs',
  e: 'AQAB',
  use: 'sig',
  kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
};

tokens.keyWithoutAlg = {
  kty: 'RSA',
  n: '3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78FAFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8' +
    'yhOKlvoyvsUFPWtNxlJyh5JJXvkNKV_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs',
  e: 'AQAB',
  use: 'sig',
  kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
};
