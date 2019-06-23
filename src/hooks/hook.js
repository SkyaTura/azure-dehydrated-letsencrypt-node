const az = require('../az')
const openssl = require('../openssl')
const argv = require('minimist')(process.argv.slice(2))

const delay = duration => new Promise(resolve => setTimeout(resolve, duration))

const [phase, ...args] = argv._

const app = {
  name: process.env.APP_NAME,
  group: process.env.APP_GROUP,
  host: process.env.APP_HOSTNAME,
}

const dns = {
  zone: process.env.DNS_ZONE,
  group: process.env.DNS_GROUP,
} 

const hooks = {
  async deploy_cert() {
    const certs = `./data/certs/${app.host}`
    const cert = `${certs}/cert.pem`
    const privkey = `${certs}/privkey.pem`
    const pfxCertificate = `${certs}/certificate.pfx`
    const password = dns.zone
    console.log('+ Generating PFX')
    await openssl.pem2pfx(cert, privkey, pfxCertificate, password)
    const payload = {
      password,
      appName: app.name,
      resourceGroup: app.group,
      filename: pfxCertificate,
    }
    console.log('+ Uploading PFX')
    const thumbprint = await az.certificate.upload(payload)
    console.log('+ Binding PFX')
    await az.certificate.bind({ ...payload, thumbprint })
  },
  async deploy_challenge(fqdn, tokenFilename, tokenValue) {
    const subdomain = [
      '_acme-challenge',
      ...fqdn.substr(0, fqdn.indexOf(dns.zone)).split('.').filter(v => v.length),
    ].join('.')
    try {
      const recordSet = {
        ttl: 5,
        zoneName: dns.zone,
        resourceGroup: dns.group,
        recordSetName: subdomain,
        value: tokenValue,
        type: 'txt',
      }
      await az.dns.recordSet.put(recordSet)
      await delay(2500)
    } catch(e) {
      console.error(e)
    }
  }
}
const phases = {
  deploy_cert: 'Deploy certificate',
  deploy_challenge: 'Deploy ACME challenge',
}

const hook = hooks[phase]
const phaseName = phases[phase]

if (!hook || !phaseName) return

console.log(`=== Phase: ${phaseName}`)
hook(...args)
