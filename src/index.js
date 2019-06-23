require('dotenv').config()

const fs = require('fs')
const az = require('./az')
const dehydrated = require('./dehydrated')

const azureCredentials = [
  process.env.AZURE_TENANT,
  process.env.AZURE_USERNAME,
  process.env.AZURE_PASSWORD,
]
const blackListedZones = [
  'azurewebsites.net',
]

const init = async () => {
  const dir = `/${process.cwd()}/data`
  if (!fs.existsSync(dir)){
    console.log('===== Create "data/" dir')
    fs.mkdirSync(dir);
  }
  console.log('===== Azure login')
  await az.login(...azureCredentials)
  console.log('===== Accept ACME Terms')
  await dehydrated.acceptTerms()
  console.log('===== Fetch Azure resources')
  const [dnsZones, webapps] = await Promise.all([
    az.dns.zones.list(),
    az.webapp.list(),
  ])
  const queue = webapps
    .reduce(
      (acc, { hostnames, ...app }) => ([
        ...acc,
        ...hostnames.reduce(
          (acc2, hostname) => ([
            ...acc2,
            {
              hostname,
              dnsZone: dnsZones.find(hostname),
              ...app
            },
          ]),
          []
        )
      ]),
      []
    )
    .filter(({ hostname, dnsZone }) =>
      dnsZone &&
      blackListedZones.findIndex(zone => hostname.endsWith(zone)) < 0
    )
  for (let app of queue) {
    console.log(`\n===== Register App: ${app.resourceGroup}/${app.name} (DNS Zone: ${app.dnsZone.resourceGroup}/${app.dnsZone.name})\n\n`)
    await dehydrated.register(
      app.hostname,
      {
        APP_NAME: app.name,
        APP_GROUP: app.resourceGroup,
        APP_HOSTNAME: app.hostname,
        DNS_ZONE: app.dnsZone.name,
        DNS_GROUP: app.dnsZone.resourceGroup,
      }
    )
  }
}

init()
