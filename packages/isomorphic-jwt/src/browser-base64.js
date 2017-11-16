function utob(u) {
  return unescape(encodeURIComponent(u));
}

function btou(b64) {
  return decodeURIComponent(escape(b64));
}

const Base64 = {
  atob: atob.bind(window),
  btoa: btoa.bind(window),
  utob,
  btou,
  toBase64: u => btoa(utob(u)),
  fromBase64: b64 => btou(atob(b64))
};

module.exports = { Base64 };
