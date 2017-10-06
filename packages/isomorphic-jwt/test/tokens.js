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

tokens.RS256token = oneLineTrim`eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYiJ9.RXIxREEzU1FwZkxLSmZycUU1K3VaQzFnSlBJV1JnNTFRdDNJNVhjdkVGejhRRjdXcU5ZK2dCNGJRREFOMllEanhnMUkvOUdNRm5JeHlwQmhiVUZFcGFUVk5FcHNIa1pFeUs4VktWOGs0bXg5QlhnS3NjRll5eFZyR0ExUFh4ZDQ2dkI5Z0RXYUdpMGtsb0MzYm9YY3B5OHJWeC91ODljZzFYeDQ1Skh4ODZPTDh1TlpwdXV4RUlTam5QVjN4SVY0WkFtdUY2QjBoaEd0bGlPenljQUJiWWRDZ1JaMGlNZDJuMGc5QlpKNDhQVG95NlJtNFFjK01mcnVQWmxnVTB0VkREZHN1UkovM3hrZ0JseDNCbjZ4WEV2cEZJRkhybUY4MGd6ZWpzb0VaYmlNVVNrNEVzeGxDRi9vZkpqZkZvZGpnNDY3bFdHMExWdW1RLzNDdzYwVjBnPT0`;

tokens.RS256invalidToken = oneLineTrim`
  eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYyJ9.0rXhRx-Dtqs_EICINM_hOci-6OkvDlss0FvtOwdkyEy
  82yYNJdjxSyNWOPdRnwiHrWp-vL-He-ul6xm7BtZ-tQnbZnU2QlT2nRTciOlt9_x7PVE1SnZVzMbc
  8PYoc49ipbLsmjjqrIpvGP-le1vctXsw2zg5IbMCEBkIH20Kc1U`;

tokens.RS256publicKey = {
  "kty": "RSA",
  "alg": "RS256",
  "n": "o1VZ9_2XsijRDA5eIRNtZmqgN_3QG4N_NhiwBJNekg7ufpj0rakjEjFbq8bUHcxxJJGTmdKa--K3chJ8jTaf9hlQWgVAplD9waPXqfT480ejjyXW0qA7Rqg48g2bvG_tA1EUVSyrkmjkNIF7j1-1F1UJ3dgiHq8686G7dFR7TkmXOD3RiMQ2LEtUcmbZLanmGWVRgXSFkjCl7mSA2qN-nq2X79c06x14LZWeLKE0IdNET4L_UIrG7XOdwSgOisOWagJWHGmcq_sEbNngSQFf1iAeEhmZW6OBGGi3m3WfFPtJCUmC8usBaO-H8ONVV3_DZxcR5P33sRyvOIQ2bnuEIQ",
  "e": "AQAB",
  "key_ops": [
    "verify"
  ],
  "ext": true
};

tokens.RS256privateKey = {
  "kty": "RSA",
  "alg": "RS256",
  "n": "o1VZ9_2XsijRDA5eIRNtZmqgN_3QG4N_NhiwBJNekg7ufpj0rakjEjFbq8bUHcxxJJGTmdKa--K3chJ8jTaf9hlQWgVAplD9waPXqfT480ejjyXW0qA7Rqg48g2bvG_tA1EUVSyrkmjkNIF7j1-1F1UJ3dgiHq8686G7dFR7TkmXOD3RiMQ2LEtUcmbZLanmGWVRgXSFkjCl7mSA2qN-nq2X79c06x14LZWeLKE0IdNET4L_UIrG7XOdwSgOisOWagJWHGmcq_sEbNngSQFf1iAeEhmZW6OBGGi3m3WfFPtJCUmC8usBaO-H8ONVV3_DZxcR5P33sRyvOIQ2bnuEIQ",
  "e": "AQAB",
  "d": "lvJvVj-4LP-JyuGQXnMM3OTXs0dPR84sB7ujGGd1s_g2syr6nW-9qLeS59q19-AUBF7BkRxQ_U6WiMbK8tqz1IWqe7d0-v_ItGeODVUHqhXf85Bdy4Qno_Idxp2K-whZe4I4D0tcOM_VbyznGyaxPqHpn2t6hO8exUAH9MeKuVrQ8TwUVbZZTkPwEYw-nRjDSmA6tUEIbFrCKLoh5d4oNOsGO0diEv5DL_dYpY2gy4ySxh5aXsP4ii5jQLkqwJbBEV1lqZeAVd2b4r7jwH9NOYLTyoq4JZiH9W2nLlDQq85t_vti8iHEjpFSclmTwDSKzUWcuT4LLMrgSpQaNKh9QQ",
  "p": "1-VELkzKCwa4POoPE_vT3M1KnFxfCmR1ZLb3ikl2tEWHBa7z_L52IvcvvXDdSmXjyt4Svs6hV-IUg3YMPsvrVePs073hWu1NjdfOd6QQ5qxUQIt53m8IIur6nXtwxlB3y4ScBJpiW41g1NNDu7aGtSQSrJglaVHnhefCPJtJovk",
  "q": "wayI_SIj_e07N4fz4jfYSrA3YIprtBb_1vI3TWAj-AwZyf-abOA4ahZaWELsDYEPUkZ-kwRQNIzWG8fd-PctJsc9wYmnENK7z0y1mIB5pPPymhuqHuszZYYP2QZzlS8U4_SWSgRM9IYmBUNz2Do9uRkqp_GMttoYYIXj5FvEDGk",
  "dp": "yll_IuokAFum-KjjwvYn526efJjzFzl68g-vSXR7hpEX8VK-KeiVr0YA_8y2DBIdg7nK1f2zKTyjv2c4KO9VvmXnRbpVarS6GLTpNieXE6z3NpvDeKCWfqvAgzP8SlOHREAhPws4HtkOpcrxVBHKhiKuQghEIEd8-Xt0CPv-83k",
  "dq": "sY_ypEmJwAOg1_-wDIXwqkE29C7UIe84LiQxqaHsOD0346eROCK19iV6PRNWAeeCWYdCAp3gvt0ka6Hpk5libvwaVXdTkSvzflIw55labW4uzTVx2hj_LSQlIW81xt-8gmY6569bso_PCeJWsjZrYml9Xy4pOXdpBA2c6z9q1Yk",
  "qi": "slBr8AVMS2hLSHuicTEDJxAPx9MxeVIpQA44KyQECWFd-asoWY6LZs5-XexJqJFMcfWzwrZ7-RALWyRhwXNls3WAV9KUBWjKeA7ruaZJHSh10XVwXRzRW-IUI2ylb_KrxdBDi3Z2wwixXsM8ji4AVOZVIwlTEWHCpWg3bCDL23Y",
  "key_ops": [
    "sign"
  ],
  "ext": true
};

tokens.RS384token = oneLineTrim`eyJhbGciOiJSUzM4NCJ9.eyJhIjoiYiJ9.SWl4SW81RENvZUI2QjBTTW9zakxyUTF6RjBxUGlBWkI5QVVTRFp4OUQrVnJDczVQN2E3NkVBSXREbDY5WlRCclpaNHRGQUNqcmlQYTFMNmR4N3c1U3podDQ2VEpuY2JUbDlIT3VzRHo4bUZ3cWlBTm0vSmkxQjY0aXJLUHhtMGp6YTBrbVg4RkR0WEVaWkdYWWtYLyt4WnFGNEpZeUtOTXg1cktEdk5UcFZzTzVZUmY4eTBxcVg0dDJ0ZXBNOHZQNDlnRWhEU0pqUTVJeG5RV09TQmlPQTcvY3B1RXlnTUI3eEtNNUVrSk1Td2VmQVZlc3F2MFQwNE1YWWxqL1IybmdYM3Z0cUJZU2Q3Y2FYL3pBbWQra2NvWXpoSE5MNzlGZ3UrR0xzWkxZdXl1dS9BK2pzZ3VKbnp5YVVjOVBja1lrQ2FaalVjcmhzNjdaQktRa0JFQ3N3PT0`;

tokens.RS384invalidToken = oneLineTrim``;

tokens.RS384publicKey = {
  "alg": "RS384",
  "e": "AQAB",
  "ext": true,
  "key_ops": [
    "verify"
  ],
  "kty": "RSA",
  "n": "xh-_XD6d27BdNh-JB4Bzo4B9j2olCwzich4f-8BI8ctZ0J0d3IFSmJUTa8pihg3ZuhV3V8XcbphMIvhEfbJa4C9xejj43A85NB8CKqrTi5KxWRDCse1xzEL-16jTnFA5k-KZAzZhU1LRZN8_eoT8oYm0k3WQkxCnpt28xbwDWaEQXZ-ys-9IpmSGqxRMxRmIMfHgi88fGk5aizRSBYlI0_ey2cpxVLq8wZI2gWp6RlrwjUFh4gr0kwcxQYLvILG9NsljzLWQALIsarTcC7GvWDtQbswclSLgB6n0rGs8ndst-k6rggl2wj6u-RmGiFAHP2so0BZrlXi_OIjw-MVjXw"
};

tokens.RS384privateKey = {
  "alg": "RS384",
  "d": "HETVYg0RKxJ8CkfvnmFmnpKr17W2eWAqQ0wnFh22isGQHCL-6sKNDXZf4gZrjmMViOadM6norOMQIgE4jJLRQqGiWGUepQ-LAvPVtE7Rhl207ldk4ExX62Q3xn-xSeFshbxURtAQjPoJJJJyFUI6ZbYnTM7-hO1gbn---pu8AqKnH6EYnoe-VbbpMRn0BF42byPjEy0vEX9iJOYks8U_RpRWBCTlhAwqoTt_zpvQ9NRcOjq4Rkwd-geTsfShnM_O-sQ7aFFCsNgCJif0k-WA_2YtJQcHdv1JC6SxKvjWEBLpOGK444zoOYnOLoUkgLE4YxFePPdayMzd_AkcuQG4IQ",
  "dp": "GgCw6j_EvgITYTVhJzflH2xsKBz837qkbQVvHfMjjOVwM5XZ2vLVxqoBaGp-WBI-njJDiGtuWl6M0tcLBbZxn1IIP1r96-HvwbeH90i8-b1_FJJzGhwlqjH2GKO-gwf2G1liVnmoxW_3oszi3iYHNeFAVBnOCsw77cRNLHPQ2DE",
  "dq": "dfmbp7vHWwyW00boYYG9YzwwYxWuUJaVXLr-Jk0uD-YLE6KfF-QUAYl4H1KF-YdQoitDDmzJIcV1gM6XnAd2R_IQ1TIhd6AzgKBiJB_u7yF0dWwDySxLFODF5qUz8Ar3T1pJdkmf8pLOieGNehja9vYr2Zdj35hZwUV-UYXPEkM",
  "e": "AQAB",
  "ext": true,
  "key_ops": [
    "sign"
  ],
  "kty": "RSA",
  "n": "xh-_XD6d27BdNh-JB4Bzo4B9j2olCwzich4f-8BI8ctZ0J0d3IFSmJUTa8pihg3ZuhV3V8XcbphMIvhEfbJa4C9xejj43A85NB8CKqrTi5KxWRDCse1xzEL-16jTnFA5k-KZAzZhU1LRZN8_eoT8oYm0k3WQkxCnpt28xbwDWaEQXZ-ys-9IpmSGqxRMxRmIMfHgi88fGk5aizRSBYlI0_ey2cpxVLq8wZI2gWp6RlrwjUFh4gr0kwcxQYLvILG9NsljzLWQALIsarTcC7GvWDtQbswclSLgB6n0rGs8ndst-k6rggl2wj6u-RmGiFAHP2so0BZrlXi_OIjw-MVjXw",
  "p": "9C5TX_J21vvCWU-AhGKcwGoRQoulWYWQG_I2fG7VRHJ8iNLl4BzI7Dh9-smhFs0AWKef2KOzeaHYgiQW6r3pitOi4UULcKTCi7r0Lom2NuSOQNXqFcLhYi6-LcXKxFYrepuEmS6Faf_3TEep1iSC4EmXNsU0cJ9ML_zhQHxTDBE",
  "q": "z7a5k7si8zpo01C0aZ__J2XqI27lIa9lTqj4wM_lBS3w-jbG9HX2LSPdGG0j_Xpbr9XkDD2lhhuZ5iCrvBJdbubMp5VAo8APoZzjIABZ5VT0XMtHXKWcdq01H9tt_HUa5mR1OTicLMcKpOiXcH89jxfyMDu75_U5tMvtiLtYqG8",
  "qi": "QitSLhL0i1HTK87z8c6oNttYcnPKf-y0PSCifPbn85Ya7C4WYjH_fXchILBRM5dJmVIR7yDwlLTSlPOBItF0nQ54Bk61mdZsYBj72iNS-WnRZGb2RDuVAb9ticdWmoveKCrS8ku_J0D4f5FFwz2Q4mt3dmQ5Cus4cHnjUFon75o"
};

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
