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

tokens.RS256token = oneLineTrim`eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYiJ9.Txm8oSmYNECxC9WjyRe-4gf17ozZ6uOyr03IAETpTBzr7PF8M1IMBnCjvqK5wIZ-C71JJavkcwXSpaEMF6HzIaYHFJ5KKkpy9v1LW8hoWoB7kAc0cNrMW0ZKRcWNBhH_SS40u2jikBxGKNA7n12D9ywTinjyjXh9q_jmSz_s5yn_XWDIXegVAJLtXDBkrxNxHSVc0_itLW0B4cWwAandO33h1pzwq5h2s1wdTrlCzqzwHy3F0zxgsvWWKLWXQeJDCjqQ6CQO6MFATPfXIrVTe-j2QYQylPFOPWyrSRtEpsVGF4hKLmMF0NTVm1zp8W3DrRWK2bJBSV2lFlJvMFjigQ`;

tokens.RS256invalidToken = oneLineTrim`
  eyJhbGciOiJSUzI1NiJ9.eyJhIjoiYyJ9.Txm8oSmYNECxC9WjyRe-4gf17ozZ6uOyr03IAETpTBz
  r7PF8M1IMBnCjvqK5wIZ-C71JJavkcwXSpaEMF6HzIaYHFJ5KKkpy9v1LW8hoWoB7kAc0cNrMW0ZK
  RcWNBhH_SS40u2jikBxGKNA7n12D9ywTinjyjXh9q_jmSz_s5yn_XWDIXegVAJLtXDBkrxNxHSVc0
  _itLW0B4cWwAandO33h1pzwq5h2s1wdTrlCzqzwHy3F0zxgsvWWKLWXQeJDCjqQ6CQO6MFATPfXIr
  VTe-j2QYQylPFOPWyrSRtEpsVGF4hKLmMF0NTVm1zp8W3DrRWK2bJBSV2lFlJvMFjigQ`;

tokens.RS256publicKey = {
  "kty": "RSA",
  "alg": "RS256",
  "n": "9_9EQfTF4WaHOud7sR4xDp5yXWqwfRtEYovFWfwS-cgL9GDw7F9Pbq4KO-PHOHkVUS6OrfIH52IZ6ydPpJWDypK0it3y8stdsqMtEqSpRihJ5DHZp6keY3nATYPwTzjVb1B70pbs4UW-3efYjp_Xw5ssdkh_sl-bgf9q7ykuSSJH4X3lXVWcwUphgtqemgTYRoHNd2KLukEWxzkKbW92nu_PbNsS87l094fvGH8cQxCmXjtQZD791hfel2MlZdxzRLnWfmFhQJOYAavBW1HuAOz7F8yLOW4nPXybZJ2dhugBkCmUfFIhcVvtf-QnPt8bNtmp5LuW1IhUp6lJfnpYEw",
  "e": "AQAB",
  "key_ops": [
    "verify"
  ],
  "ext": true
};

tokens.RS256privateKey = {
  "kty": "RSA",
  "alg": "RS256",
  "n": "9_9EQfTF4WaHOud7sR4xDp5yXWqwfRtEYovFWfwS-cgL9GDw7F9Pbq4KO-PHOHkVUS6OrfIH52IZ6ydPpJWDypK0it3y8stdsqMtEqSpRihJ5DHZp6keY3nATYPwTzjVb1B70pbs4UW-3efYjp_Xw5ssdkh_sl-bgf9q7ykuSSJH4X3lXVWcwUphgtqemgTYRoHNd2KLukEWxzkKbW92nu_PbNsS87l094fvGH8cQxCmXjtQZD791hfel2MlZdxzRLnWfmFhQJOYAavBW1HuAOz7F8yLOW4nPXybZJ2dhugBkCmUfFIhcVvtf-QnPt8bNtmp5LuW1IhUp6lJfnpYEw",
  "e": "AQAB",
  "d": "ebMiKv_Uj61B1Y09bQi06EinNOKjY3GbGIUgvuzt3vflrfJYqJaJI3Zy_TrlS_hXlrQzPndUm57Pu09aTRk2SJW_1ZnfnHhiLcTX3JtDmnMw97Pi7N0YVZas4R1LM4VfcDXd3dVEv7P7W2hoJG2ac5pVsmIXkFBMvvm5302lMiuSMByzNMf4PTPWPTLp27unRB6L6dKQ-RFPt9snJ9mMusJAW-KJQp-9c3rFb_fzDpulIpeag4iOj0WfppMsyNKH-zOcYWE1w7gb4RLQmcwfyTXyWL0uvY1Up1ujoOD77vrp0ipjSBltIdaVYerqMurpGK27hTsAZpO2z6IfeKV-2Q",
  "p": "-_64ai660Tl81SRA-9K2tiqc24MpO6WVLCzrsm5K6DW0qArKubLST1GucBjjgZieFJxHzFrGp-OgbCZsXXXfOfVVKefXEmgllcyCZOSVvDCRV8_Ttf04a2ezp-igYpNocrswFIdavl-2sr6_VegOb225tLz0RB3CPvvZkHF1jLc",
  "q": "-_BHxGLJ6OrQ74zctsLFnLO1P7QwsZ3wS0p7EtUmABnASHiz6qH_l2rtoqtI9K4y9Jo3nMBlqz1H3PGfQCH7rFl3QYruEaRVNWeVE-2IGZrimCfXZ8GSAwX-_cfHah9DZ_qRWzGnxQu9zNTdwBdbhjnUxjlLV4JbSGvINz3mq4U",
  "dp": "k_ZnsClKFmnL65bC9VovYF07BwVHo7dBFNQ3fOiX4SsPrY_QoyLlrB9I7pcelszXHUD6Q3qVpKTaYEZbYLFCZlSwMc_oj-1JDGEtuzIg3YQjA02LgRNzGlWkvpWv_tGRBbT1sUgctyWaL_Aihr2gJDtoTECaqJhUowjcIZ0NKZc",
  "dq": "QA9gsDbOUEMkzURr-qybwrSPKZuPphoat4pAsRExkGT713GZjdeTPdUah3o2GsEQg9GSwnDJaTkzxKJLc-swKyq0gB3rWuEGKYYlCeQj7x7K7xVyWBeIIOytYaoisoEwiofT3fRKTHgn0qVtnSJTS1X5HE4FMkMbItcFGcbLmGE",
  "qi": "SAFTHbwwKON5RSWCiStaA0K9ANUZwRuAxag_8A4v6-qr9J2OpyYrBm-of8ihi1Q5QGkCcE_wie5eCdPhxG7kTIB-VD0OlgWaiqPZ_bVgJqKRenaCnfMg5wolIRdjrlhVa50UTA3y9tPqMgZ5ilNWWvb1VuCvMP6Pw-NsLtiinXo",
  "key_ops": [
    "sign"
  ],
  "ext": true
};

tokens.RS384token = 'eyJhbGciOiJSUzM4NCJ9.eyJhIjoiYiJ9.FmLc4ukvcTrctczh3DPot3c-D4DZqSRrjlSFnDL92m9lAigjQocS7AhLp3xKK5dAEjqEBNB75aNRQH1fYOc4N5My0YXamu8A7JNyfe2X8JKj4PnysPR7txavA40lO4OdpfPOSxI-Dnkhqip9Rm5KaCKn8EmmHO7TR4Da69ZogmLmRZGlmYtRht-wo6Sz0V-um2upVfxAbiZf6hqNVh09lC1Pe4hputYfANbVE0cACClevfT6RAcUALbpZq9FjaTx5MoStm0vTEQyjQAXRS8McHuxF-St-J0JPx_oMsgYNXgSZf2nnDFMYAr74wGpj6cIdf_QCcGhDnqkuyCPX9uGVg';

tokens.RS384invalidToken = oneLineTrim`eyJhbGciOiJSUzM4NCJ9.eyJhIjoiYyJ9.FmLc4ukvcTrctczh3DPot3c-D4DZqSRrjlSFnDL92m9lAigjQocS7AhLp3xKK5dAEjqEBNB75aNRQH1fYOc4N5My0YXamu8A7JNyfe2X8JKj4PnysPR7txavA40lO4OdpfPOSxI-Dnkhqip9Rm5KaCKn8EmmHO7TR4Da69ZogmLmRZGlmYtRht-wo6Sz0V-um2upVfxAbiZf6hqNVh09lC1Pe4hputYfANbVE0cACClevfT6RAcUALbpZq9FjaTx5MoStm0vTEQyjQAXRS8McHuxF-St-J0JPx_oMsgYNXgSZf2nnDFMYAr74wGpj6cIdf_QCcGhDnqkuyCPX9uGVg`;

tokens.RS384publicKey = {
  "alg": "RS384",
  "e": "AQAB",
  "ext": true,
  "key_ops": [
    "verify"
  ],
  "kty": "RSA",
  "n": "w9FVI553fiJnuhTgGSv534ZLwzGLmhBQ6wC2CphSSwu82Wi-FS05yWoGsGTZN3fA8SAZ_G7_iJDwhrEkEU5Gl3aiOvczSNLYlEzifN6YRGCdeguX07p6nRjdRREVX6EexJEn-12O-KYUIsVEDO47r9FTSBLQFaHNfZU0-RA-MLErMFof0yxMc-BMfiWVx4FeFsK0yFiwHeFxICPDu_-XlBVbx7mo2gi9PYOLfMvojSQtDpDww2Mq-v0ZAXG-27Ls2tht4FsC5JQlYp7BieeoiyP2aJv_DNDCsMuCWJaGQP8U64J3P96MO1tnO7AMHwOY-y0-0oUH2Pa4-kgUfGNJiw"
};

tokens.RS384privateKey = {
  "alg": "RS384",
  "d": "VSQ-SCP9Yc802bB89gTsexep9n-i6wSAIoYnIPk1AuNiJAfKamvFLgHXUbgvyFHeBxnFosBihC89HduEyq-FuxK-nDPizR28RNMfQVsJyuVVY30J8WoqKQdoIkE40WE9fwt8XmvCH_QaWjn6ikLFmf9CnlprtpQpRJrtMwQwfjuvg77RgldRfw0D7DkcGSBT6_Ajn-VKdMjg6Oua0Njfl4Bvv_mX0MRdJlQIRQd1T3Q5AGgk8Wel6l0pm-gLqAmHAWG3hC-9qqAwVgqS0KB4e7s-tQcSKhmugeP_OsI7kbmQehl3ogYPRlkuH0--8EWWcTbhFLbhBfE-oZr5_Y5-KQ",
  "dp": "YCoH-RW2PUSmSv2Tz8G6NSpTi1mahmLoN15TSD7R06cexu-v6KzNG9w-aczirZ3EpcngghxXC_5AmYH5GZTesdJRoCIx6a2_HK1KbjUzCbL0y0RgP2B5rM0zX5OQqWcp6k9vl2XhtoNa1b4Egdj9VwSHcuNC0IvaFBVKLhhuIlk",
  "dq": "WjldB6sXxkD5oDsSqeOshk5QTan-HfdkFH7B5Wb90m7TcktX7dbXKjb7s7tVUGZSAsj75M-4_kM798ODfZI-z5-fzvt9TEtuPlN2gSD__8-wMNU3-wasm-8PenpOPKrgktZTHZEITkeWD1yEyEStL-L6CcM3DQzD0eg3qiPG2gE",
  "e": "AQAB",
  "ext": true,
  "key_ops": [
    "sign"
  ],
  "kty": "RSA",
  "n": "w9FVI553fiJnuhTgGSv534ZLwzGLmhBQ6wC2CphSSwu82Wi-FS05yWoGsGTZN3fA8SAZ_G7_iJDwhrEkEU5Gl3aiOvczSNLYlEzifN6YRGCdeguX07p6nRjdRREVX6EexJEn-12O-KYUIsVEDO47r9FTSBLQFaHNfZU0-RA-MLErMFof0yxMc-BMfiWVx4FeFsK0yFiwHeFxICPDu_-XlBVbx7mo2gi9PYOLfMvojSQtDpDww2Mq-v0ZAXG-27Ls2tht4FsC5JQlYp7BieeoiyP2aJv_DNDCsMuCWJaGQP8U64J3P96MO1tnO7AMHwOY-y0-0oUH2Pa4-kgUfGNJiw",
  "p": "7JB8aXzAGSph1oGKVoRqRITiLeyMt74bBhtpbbWztQS90ldgGwctEGp-CQuQhLBVDos4vhQ_iiBP3qlSID-T02JnK1ONiI3DY5C3YMpYJQize9OP6lQXThpP0mdNPSRYYX08hHfRnD8951nR7pVM-tHBUqftqehULShLSstuFNk",
  "q": "0-fYq4Yo92tyzNBR9CsRaaQGINQSRlzKFzf8OL35eyANzvYctUXq3z_CvZGymmHImOiAa45dfHFEpr9eisSp_7ErSjtqWL2Z7KO2y18hLod8e1o1lInCFDeXR7kIuXpljphr7PSatZO1pEfRXXHPv4-mk1nXoq1do6IkknQegwM",
  "qi": "Mv1cdjNZslQRD17bwRx9vZbmdKThsOsP9GrCtT9u5FHSN1l3PTMfPi-xNleF2aVrqbaSKFRceAl_WjncAd7geg-zUYMPYGinUeDT6aLI7ZY9qYmykqtEN2x7zgamPsr38dugWprzLvn7KZLVWXej8DoqnTNA88maoks-FJkJlY0"
};

tokens.RS512token = 'eyJhbGciOiJSUzUxMiJ9.eyJhIjoiYiJ9.0SFnAk08HFPopkWPeWLB_FeQ9CYb8rLxL3OGbxsoiPxnLdSnMXnf594dc27Cy1SHvWSrjtW5czTHizxmfNFJllPpTryvaJ0DtmaN4yw8-wXIm5rcSWJ0PBpw3XgkkLHvxjt-UPx8pL0D4V-CJKZw60hqR8eTaTYiZb64QK-yra1TreJn7esj4_zdh4W7Km3DFC6VYsDa9q71N5IHPPcH7FEwt9fQ1_E1_s1Rvs0PgkF-B1IUa0DhQDyWCoIfjfqN4chV2nxSQWJGCUk-tP9NutntQjt_Lz0TKWDbJbsyLX_5CKzaWajwe9FrXAyTfhzSEAPNGiwtvTGORt6Yt58_og';

tokens.RS512invalidToken = oneLineTrim`eyJhbGciOiJSUzUxMiJ9.eyJhIjoiYyJ9.0SFnAk08HFPopkWPeWLB_FeQ9CYb8rLxL3OGbxsoiPxnLdSnMXnf594dc27Cy1SHvWSrjtW5czTHizxmfNFJllPpTryvaJ0DtmaN4yw8-wXIm5rcSWJ0PBpw3XgkkLHvxjt-UPx8pL0D4V-CJKZw60hqR8eTaTYiZb64QK-yra1TreJn7esj4_zdh4W7Km3DFC6VYsDa9q71N5IHPPcH7FEwt9fQ1_E1_s1Rvs0PgkF-B1IUa0DhQDyWCoIfjfqN4chV2nxSQWJGCUk-tP9NutntQjt_Lz0TKWDbJbsyLX_5CKzaWajwe9FrXAyTfhzSEAPNGiwtvTGORt6Yt58_og`;

tokens.RS512publicKey = {
  "alg": "RS512",
  "e": "AQAB",
  "ext": true,
  "key_ops": [
    "verify"
  ],
  "kty": "RSA",
  "n": "8JqTVUuAPBHduqnzybUJauc3AJCEyhbwrCy118uJ3B-k48Zoxj0cM3WCZFoX2_Xyl_Nwzg8Ct-eN1RikqlWsYKxZUQDwUM5stuFLuPuI2fif4CRjQg8VApQKdSjIXpusHmUfrNxUDKZ8EEys8HPi5aQPkZUfvNwVzn6cYDY-1NBWmxU4U8yKXTiEbK61hgnKtuRni91IC651KcWy3hjPuX4WpSlNI5kXlCR7A8BuKxCseDDrthGYEfVYBdGHM5mC63drRhabxRnN_f7zMAdX-6ARnfKWPtAVNTgXSeLOYcDF8HpdK-TjAYDPlCRxGUzjkeuyiOEancfdNyqJ5h9uiw"
};

tokens.RS512privateKey = {
  "alg": "RS512",
  "d": "Iylb1a-6dkzgG_rhSz1_OlW-5oC4PzZaBrdj_bzbkUU4mibxQeNFX0nRe-vkp7sKMGWduydbbNfUlOtMiS4LCne1d86M0CpSnelP4SE1TzFz39RBgzJkDiPnYVbL7XOPlEOP_PmX-N9Nqy4haeRtqMSwl8R0xmtdbnd3T-ItjXj6XJAiodHWhIRpi1t2GayYBziWJe5shzEU7SN3OsQ9ioTlX1ac-fu_q-cIfX2UnV6u535PLWEC5_qDEDaHMdMUn3DMJJJQqOpRQUDK0RmvteDUnR57-S6s7Oz34b33hk4J2dKQ6zQ0xpNtIvHRDICkGljGimvox0wJKVphwEGo5Q",
  "dp": "BWTjwA20sDeqjwF_HjrHkkt7ceztzVgGw1Jmd8AoNjDx5pZFY_JujJpOuIEINNHFd2LyrT4dkrm0gt2XXxHaD51fQaJBI7BB8uS-jEjeQ87zWLR2xaz0VPbej0rlX02MK_8Z-eLcxOVzoUz1WBjaMDdjRRUsH9_dqb45--YqDbk",
  "dq": "okZmcg4baUrBrarj57SgzRJHirb1nYfiIyUIq6dNDOW_VqFY_PKqgDFAllc_JNbF-mavs83NWpM_WSbVse8m4-gT0yPY-HyJq4WrorinFqkPWExVrmPUCiYdGUFVr6B7Nqa6du8rVY8sXRkyw1ItCZi7r5Gu_RpGaAoetS0PAkM",
  "e": "AQAB",
  "ext": true,
  "key_ops": [
    "sign"
  ],
  "kty": "RSA",
  "n": "8JqTVUuAPBHduqnzybUJauc3AJCEyhbwrCy118uJ3B-k48Zoxj0cM3WCZFoX2_Xyl_Nwzg8Ct-eN1RikqlWsYKxZUQDwUM5stuFLuPuI2fif4CRjQg8VApQKdSjIXpusHmUfrNxUDKZ8EEys8HPi5aQPkZUfvNwVzn6cYDY-1NBWmxU4U8yKXTiEbK61hgnKtuRni91IC651KcWy3hjPuX4WpSlNI5kXlCR7A8BuKxCseDDrthGYEfVYBdGHM5mC63drRhabxRnN_f7zMAdX-6ARnfKWPtAVNTgXSeLOYcDF8HpdK-TjAYDPlCRxGUzjkeuyiOEancfdNyqJ5h9uiw",
  "p": "-gJhNjcsKVfEYFOqfxOEW8zl0nGl410TzBG0WYzY9PwImwHObsS03zRhjM8--jPUwig0LQsCr9jBdg-c5_YQ6_tzU-rGx2d-N4aY_VwSOietYV5pZPl70jtMEaTfcpaJJpzIDelOh9MyGubFK3ycnih2IKsganQl8vHUNZ3dN_U",
  "q": "9l6ACo86raUOaFgEbXq40KDENYgBTr9ftLO3J4OzqhKKPb14SgiksaCnnbIeQfhLla7G7yMDrFYxWwodz5_WLD83kdV6snrnWPJumvbrWh05roaGvofhk52rJ7gFjn33xnZd3YGcmReAfy6VOafQ9VFhH_ekMHifYH9g9vdufH8",
  "qi": "K9-Cq6MPltnC7h9yq9PM8RcP8fNuL8pc_u2Xz46azTWST_j7HAQRW4IsEm8OV2-hsvNcHklj0BNUxWukBRCf-T9AoGXnzdgUNAU6GoMlHhN3oxrHYS80mUiPpGvOy1GbvKH6zUjW7dpBntPiK79UegOwjS7AWlAKFN5Fos0xqTg"
};

tokens.HS256token = oneLineTrim`eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYiJ9.AuPyDcttfqiDCUGeZzN2Zi5Y14QiEEf5YusaDXGMHVk`;

tokens.HS256invalidToken = oneLineTrim`eyJhbGciOiJIUzI1NiJ9.eyJhIjoiYyJ9.AuPyDcttfqiDCUGeZzN2Zi5Y14QiEEf5YusaDXGMHVk`;

tokens.HS256sharedKey = {
  "alg": "HS256",
  "ext": true,
  "k": "YYqgcZK9g_FTeOR66yAiU86VV-kTN_c5iMODBK8tXuYKui5khc_iYUrvXQqSmyZ-wljrMR-ez2mKsnWfCzRROA",
  "key_ops": [
    "sign",
    "verify"
  ],
  "kty": "oct"
};

tokens.HS384token = oneLineTrim`eyJhbGciOiJIUzM4NCJ9.eyJhIjoiYiJ9.gXNnRzvVAzFuazMNaAlYQV6WV5rVzNgeyM2nZQ-409JDeeHTRtBz5u_pFc0MjL-p`;

tokens.HS384invalidToken = oneLineTrim`eyJhbGciOiJIUzM4NCJ9.eyJhIjoiYyJ9.gXNnRzvVAzFuazMNaAlYQV6WV5rVzNgeyM2nZQ-409JDeeHTRtBz5u_pFc0MjL-p`;

tokens.HS384sharedKey = {
  "alg": "HS384",
  "ext": true,
  "k": "RsjOkcfWhvsID1EYlZ1bW2ijVCdTsRE7a8I53aEmnawod-souXwK-l3br6_obMJu_HRvi3TW6riLSaND5KzjTDlju0EwZvG5k0U4XGnSB2hd7shV_AfkbxCtMfXDJq1hORtn09hfLzxKQ9tl0xVS2IyLyfXkjHRLmk9DfnS6vLM",
  "key_ops": [
    "sign",
    "verify"
  ],
  "kty": "oct"
};

tokens.HS512token = oneLineTrim`eyJhbGciOiJIUzUxMiJ9.eyJhIjoiYiJ9.dli60766qQ7ksSOPQTzL--R-FnfTcCMR5s7_h57tkEPNZITEXndPP88YJQ60mZr8PcbFI6XvjwC9gKucA3eIzg`;

tokens.HS512invalidToken = oneLineTrim`eyJhbGciOiJIUzUxMiJ9.eyJhIjoiYyJ9.dli60766qQ7ksSOPQTzL--R-FnfTcCMR5s7_h57tkEPNZITEXndPP88YJQ60mZr8PcbFI6XvjwC9gKucA3eIzg`;

tokens.HS512sharedKey = {
  "alg": "HS512",
  "ext": true,
  "k": "ugRLYsPNGICtatMOJs-UJhVbRpG83XlqwNtgz4N89j_Go3_-b3kstlM0KuUZbr9IP9IJRQCf6ElvG2c_bYH9YHrEXBCmrSMp9-s5Byw-AYerIQhVBvW4ZOE1L3ku6eqta8CVxj0ciydk_bhK1qCNdX2534UPMq4z52FE5pcI5OM",
  "key_ops": [
    "sign",
    "verify"
  ],
  "kty": "oct"
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
