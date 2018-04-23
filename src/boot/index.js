const fs = require('fs')
const path = require('path')
const logger = global.logger

module.exports = async (app) => {
  logger.info(`booting... (env: ${process.env.NODE_ENV})`)
  const AsyncFunction = (async () => {}).constructor

  const normalizedPath = path.join(__dirname)
  fs.readdirSync(normalizedPath)
    .filter(file => (file.indexOf('.') > 0 && file !== 'index.js'))
    .sort((a, b) => (a < b ? -1 : 1))
    .forEach(async (file) => {
      const m = require(`./${file}`)
      logger.silly(`load: ${file}`)
      if ('init' in m && typeof m.init === 'function') {
        if (m.init instanceof AsyncFunction) {
          try {
            await m.init(app)
          } catch (e) {
            logger.error(`error loading module ${file}`, e)
          }
        } else {
          m.init(app)
        }
      } else {
        m(app)
      }
    })
}
