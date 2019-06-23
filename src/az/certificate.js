module.exports = ({ exec }) => ({
  upload(payload) {
    const { appName, resourceGroup, filename, password } = payload
    return exec(`webapp config ssl upload \
    --name "${appName}" \
    --resource-group "${resourceGroup}" \
    --certificate-file "${filename}" \
    --certificate-password "${password}" \
    --query thumbprint \
    --output tsv`)
  },
  bind(payload) {
    const { appName, thumbprint, resourceGroup } = payload
    return exec(`webapp config ssl bind \
    --name "${appName}" \
    --resource-group "${resourceGroup}" \
    --certificate-thumbprint "${thumbprint}" \
    --ssl-type SNI
    `) 
  }
})
