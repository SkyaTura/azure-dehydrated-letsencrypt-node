module.exports = ({ exec }) => ({
  async list() {
    const response = await exec(`webapp list --query "[?state=='Running'].{
      hostnames: enabledHostNames,
      name: name,
      resourceGroup: resourceGroup,
      updatedAt: lastModifiedTimeUtc
    }"`)
    return response.sort((a, b) => {
      if (a.updatedAt > b.updatedAt) return -1
      if (a.updatedAt < b.updatedAt) return 1
      return 0
    })
  },
})
