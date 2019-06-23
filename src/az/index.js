const { shell } = require('execa')

const certificate = require('./certificate')
const dns = require('./dns')
const webapp = require('./webapp')

const exec = cmd => shell(`az ${cmd}`).then(({ stdout }) => {
  try {
    return JSON.parse(stdout)
  } catch(e) {
    return stdout
  }
})

module.exports = {
  exec,
  dns: dns({ exec }),
  certificate: certificate({ exec }),
  webapp: webapp({ exec }),
  login(tenant, username, password) {
    return this.exec(`login \
    -u "${username}" \
    -p "${password}" \
    --tenant "${tenant}" \
    --service-principal
    `)
  },
}

