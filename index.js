require('dotenv').config()
const config = require('./src/config')()

global.Promise = require('bluebird')
global.logger = require('./src/logger')('index')
const logger = global.logger

const http = require('http')
const express = require('express')

const $ = module.exports

$._isExit = false
$.isExit = () => ($._isExit)

const app = express()

function normalizePort (val) {
  const port = parseInt(val, 10)
  if (isNaN(port)) return val
  else if (port >= 0) return port
  return false
}

if (require.main === module) {
  // booting app
  require('./src/boot')(app)

  // starting web-server
  const server = http.createServer(app)
  const port = normalizePort(process.env.PORT || config.bindPort)
  const bindIp = config.bindIp || '0.0.0.0'
  app.set('port', port)

  server.listen(port, bindIp)

  server.on('error', (error) => {
    if (error.syscall !== 'listen') throw error

    const bind = (typeof port === 'string')
      ? `Pipe ${port}`
      : `Port ${port}`

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        logger.error(`${bind} requires elevated privileges`)
        process.exit(1)
      case 'EADDRINUSE':
        logger.error(`${bind} is already in use`)
        process.exit(1)
      default:
        throw error
    }
  })

  server.on('listening', () => {
    logger.debug(`web server started on port ${server.address().port} at ${server.address().address}`)
  })
}
