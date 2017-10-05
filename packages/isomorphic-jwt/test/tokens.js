const oneLineTrim = require('common-tags').oneLineTrim;

// helpful site to generate jwk keys - https://mkjwk.org/

const tokens = module.exports;

tokens.unicodeToken = oneLineTrim`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAibXNn
  X2VuIjogIkhlbGxvIiwKICAibXNnX2pwIjogIuOBk-OCk-OBq-OBoeOBryIsCiAgIm1zZ19jbiI6I
  CLkvaDlpb0iLAogICJtc2dfa3IiOiAi7JWI64WV7ZWY7IS47JqUIiwKICAibXNnX3J1IjogItCX0L
  TRgNCw0LLRgdGC0LLRg9C50YLQtSEiLAogICJtc2dfZGUiOiAiR3LDvMOfIEdvdHQiIH0.TJVA95O
  rM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ`;

tokens.unicodeClaimsSet = {
  msg_en: 'Hello',
  msg_jp: 'こんにちは',
  msg_cn: '你好',
  msg_kr: '안녕하세요',
  msg_ru: 'Здравствуйте!',
  msg_de: 'Grüß Gott'
};

tokens.malformedHeader = 'BAD.eyJhIjoiYiJ9.WACuDR_AlXngagNOa90c92xbWXYT6vHzn-OUQJl93a8';
tokens.malformedClaimsSet = 'eyJhbGciOiJub25lIn0.BAD.WACuDR_AlXngagNOa90c92xbWXYT6vHzn-OUQJl93a8';
tokens.noAlgInHeader = 'e30=.eyJhIjoiYiJ9.DRwcShm-M7fOQcRhdmtqzzuiNPsv2tAnkV2gfnDMmM0';
tokens.unsecuredJWT = 'eyJhbGciOiJub25lIn0.eyJhIjoiYiJ9.';

tokens.RS256token = oneLineTrim`
  eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYiJ9.0rXhRx-Dtqs_EICINM_hOci-6OkvDlss0FvtOwdkyEy
  82yYNJdjxSyNWOPdRnwiHrWp-vL-He-ul6xm7BtZ-tQnbZnU2QlT2nRTciOlt9_x7PVE1SnZVzMbc
  8PYoc49ipbLsmjjqrIpvGP-le1vctXsw2zg5IbMCEBkIH20Kc1U`;

tokens.RS256invalidToken = oneLineTrim`
  eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYyJ9.0rXhRx-Dtqs_EICINM_hOci-6OkvDlss0FvtOwdkyEy
  82yYNJdjxSyNWOPdRnwiHrWp-vL-He-ul6xm7BtZ-tQnbZnU2QlT2nRTciOlt9_x7PVE1SnZVzMbc
  8PYoc49ipbLsmjjqrIpvGP-le1vctXsw2zg5IbMCEBkIH20Kc1U`;

tokens.RS256publicKey = {
  alg: 'RS256',
  kty: 'RSA',
  n: oneLineTrim`3ZWrUY0Y6IKN1qI4BhxR2C7oHVFgGPYkd38uGq1jQNSqEvJFcN93CYm16_G78F
    AFKWqwsJb3Wx-nbxDn6LtP4AhULB1H0K0g7_jLklDAHvI8yhOKlvoyvsUFPWtNxlJyh5JJXvkNK
    V_4Oo12e69f8QCuQ6NpEPl-cSvXIqUYBCs`,
  e: 'AQAB',
  use: 'sig',
  kid: 'U5R8cHbGw445Qbq8zVO1PcCpXL8yG6IcovVa3laCoxM'
};

tokens.RS256privateKey = Object.assign({
  d: oneLineTrim``
}, tokens.RS384publicKey);

tokens.RS384token = oneLineTrim``;

tokens.RS384invalidToken = oneLineTrim``;

tokens.RS384publicKey = {
  kty: 'RSA',
  e: 'AQAB',
  use: 'sig',
  alg: 'RS384',
  n: oneLineTrim`pT1pGNTZ97XdSZOaZSstNOiZYMhPojitZ7LYp5PWP3H5V45zAiJrmWn6wvo-nC
    V5Un5E7mQmHBR89L4VEOsc7mu__Y_Rl_fO7wX9HP0coieY01sp99yww10r3ZliHdTvPywuLTsma
    xFVIso7otFRCaCr8SzAl0O7aWZPLvtRCCbx14-iBm5ZAunRE8O6L7tIRlxoevI6-zKNEgQLSpDC
    fVNDICMBK2hmbKay-NFIV8_9jQvq5UlTH6WsAO-qTdS3zeVUiQnLXKB1jTEYEjD04pOD_SgzZY3
    ek1SfsK8EVTDuOEsGbWgqe08iiEkeHWZwwkGrbKByWQvHA3buCmv5HQ`
};

tokens.RS384privateKey = Object.assign({
  d: oneLineTrim`ktGw6y5dCZtfJrvuyIuHnGY7ueHh1_rSILypgqR6Dl9_tAtPJwtcXbDr7YiaTv
    WBCgpFxyfXMMYHjRLD9wdg6nt02KCME6JNDNZeYv6HDZFvWgS7ko9VxBCqJDjgFC-Z8KCZ2viel
    y2MXuAgAvhHL-3COQWRjhXRlMIiA1WsVzeM7Nqp78g7Yn3rC5AEeq4gzeVgAGex2MU4flzrKFZh
    DOeG63ak0qH1F_1pYYj5w4PTZ1-z1aNFjkVbRF-s8r8x94E6iizbYdpEgu40ESvdSQNhwlpXb1a
    1dZTM4V1rdMjoSl0WopIyNpzj39palLKxr4tA7cGMfO8LHhHr_N3fpQ`
}, tokens.RS384publicKey);

tokens.HS256token = oneLineTrim``;

tokens.HS256invalidToken = oneLineTrim``;

tokens.HS256sharedKey = {
  kty: 'oct',
  use: 'sig',
  k: oneLineTrim`k087JsfY6xxjqVesgLHe1CZzKHIhNQyehvOsETIkpMWAU4PcaN3NkYUJR9pFGt
    OB2I9l5ECXOKVPccjNXRHP1aWpdJU2P0hqzmx-1r3QO79i2-TAQyQtcyyBXZR18-V_YIEV6YSkx
    6LiPkNcrl-sz2stgQ4PzK1mwUfl45nQ0ySxYKV8NgVmCSo4fXaxLSrCWozj1iGbZhWXCpMOLLoE
    pekHnoePD1hmFv_bq6r489YgwvwzoKdu-7vG5AhItm68X_yf_fimL8jyDG-RZ7HdssxjHl8Gpld
    -iBSO_MDC7IxWuU8Y_o9E69X7SpFrEqGs6lFXEHYgaNDL3BSK9DMVeg`,
  alg: 'HS256'
};

tokens.HS384token = oneLineTrim``;

tokens.HS384invalidToken = oneLineTrim``;

tokens.HS384sharedKey = {
  kty: 'oct',
  use: 'sig',
  k: oneLineTrim`r386O3QKO7vm7A3f5D98F-n2TBWW_SkWoSW3I0rb_pV_cV17MofSo7v8YBMMXw
    Hm4HFCmV2_CAYjIEoYaQYgiH_Tm5YVw5lWYvEvKl7Fo8jKESHTcog_NSQgQTlOhRvzbRKOAukNY
    5ulIsPNnaBgadvehm_F_YPOD0tUuC_Uts7Wk9AKObIyrOJej1lVcCzqcABYBs5dKWtv7Q6_Pi1i
    lksM4OnZIJEuKcf-Bk8hY097WFLmgavTsCYBkMj32RmLxeBpkOMPp--g8PuzcS1nTnhrVnvu9Lc
    NAVEuwxzMK6PV4QgMmrkMNrmTZcNwczIDFNvHnRegNQ5YtBMmfRXMug`,
  alg: 'HS384'
};

tokens.standardToken = tokens.RS256token;
tokens.standardKey = tokens.RS256publicKey;
tokens.standardClaimsSet = {
  a: 'b'
};

tokens.keyWithoutAlg = (() => {
  const key = Object.assign({}, tokens.standardKey);
  delete key.alg;
  return key;
})();
