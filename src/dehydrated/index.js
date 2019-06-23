const { shell } = require('execa')

module.exports = {
  exec: (cmd, env) =>
    shell(`./libs/dehydrated/dehydrated --config dehydrated.config.sh ${cmd}`, { env }),
  acceptTerms () {
    return this.exec(`--register --accept-terms`)
  },
  async register(urls, env) {
    try {
      const stack = await this.exec(`-c -k ./src/hooks/hook.sh -d "${urls}"`, env)
      const stdout = decodeURI(stack.stdout)
      console.log(stdout)
      return stdout
    } catch(e) {
      const stderr = decodeURI(e.stderr)
      console.error(stderr)
    }
  },
}
