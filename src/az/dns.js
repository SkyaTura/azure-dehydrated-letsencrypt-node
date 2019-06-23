module.exports = ({ exec }) => ({
  zones: {
    async list() {
      const response = await exec(`network dns zone list --query="[].{name: name, resourceGroup: resourceGroup}"`)
      return {
        items: response.sort((a, b) => {
          if (a.name.length > b.name.length) return -1
          if (a.name.length < b.name.length) return 1
          if (a.name > b.name) return 1
          if (a.name < b.name) return -1
          return 0
        }),
        find(subdomain) {
          return this.items.find(({ name }) => subdomain.endsWith(name))
        }
      }
    },
  },
  recordSet: {
    create(payload) {
      const {
        type,
        zoneName,
        resourceGroup,
        recordSetName,
        value,
        ttl = (process.env.CHALLENGE_TTL || 5),
      } = payload
      return exec(`network dns record-set ${type} create \
        --ttl ${ttl} \
        --name ${recordSetName} \
        --resource-group ${resourceGroup} \
        --zone-name ${zoneName}
      `)
    },
    delete(payload) {
      const { type, zoneName, resourceGroup, recordSetName, vaue } = payload
      return exec(`network dns record-set ${type} delete \
        --yes \
        --name ${recordSetName} \
        --resource-group ${resourceGroup} \
        --zone-name ${zoneName}
      `)
    },
    add(payload) {
      const { type, zoneName, resourceGroup, recordSetName, value } = payload
      return exec(`network dns record-set ${type} add-record \
        --value "${value.replace(/\"/g, '\\"')}" \
        --record-set-name ${recordSetName} \
        --resource-group ${resourceGroup} \
        --zone-name ${zoneName}
      `)
    },
    async put(payload) {
      const step1 = await this.delete(payload)
      const step2 = await this.create(payload)
      const step3 = await this.add(payload)
      return [step1, step2, step3].join('\n')
    },
  }
})
