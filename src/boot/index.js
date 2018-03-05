const fs = require('fs')
const path = require('path')
const logger = global.logger

module.exports = (app) => {
  logger.info('booting...')

  const normalizedPath = path.join(__dirname)
  fs.readdirSync(normalizedPath)
    .filter(file => (file.indexOf('.') > 0 && file !== 'index.js'))
    .sort((a, b) => (a < b ? -1 : 1))
    .forEach(file => {
      const m = require(`./${file}`)
      if ('init' in m) m.init(app)
      else m(app)
    })
}
