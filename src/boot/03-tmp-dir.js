const shell = require('shelljs')
const config = require('../config')()
// const path = require('path')
const logger = require('../logger')()

function createDir (dir) {
  const result = shell.mkdir('-p', dir)
  if (result.code !== 0) {
    logger.error(`cannot create dir at ${config.tmpDir}`, result.stderr)
    shell.exit(1)
  }
}

module.exports = () => {
  // let tmpPath = path.isAbsolute(config.tmpDir)
  //   ? config.tmpDir
  //   : path.join(process.cwd(), config.tmpDir)
  // createDir(path.join(tmpPath, 'apps'))
  createDir(config.tyk.appsDirPath)
  createDir(config.tyk.policiesDirPath)
}
