const execa = require('execa')

module.exports = {
  pem2pfx(cert, privkey, output, password) {
    return execa.shell(`openssl pkcs12 \
    -export \
    -inkey "${privkey}" \
    -in "${cert}" \
    -out "${output}" \
    -password "pass:${password}"
    `)
  },
}
