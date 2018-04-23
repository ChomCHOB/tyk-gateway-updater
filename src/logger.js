/**
 * name: chomchob-async-logger
 * version: 0.1.2
 * Created by pnrisk on 3/23/2016 AD.
 * Async log module with winston
 */
const winston = require('winston')
// Imports the Google Cloud client library for Winston
const LoggingWinston = require('@google-cloud/logging-winston').LoggingWinston
const _package = require('../package.json')

winston.emitErrs = false

let logLevel = 'info'
let logger

module.exports = (name = 'main') => {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  } else {
    logLevel = 'debug'
  }
  if ('LOG_LEVEL' in process.env) {
    // TODO: not safe code, recheck needed
    logLevel = process.env.LOG_LEVEL
  }

  const optsConsole = {
    timestamp: true,
    json: false,
    colorize: true,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    label: name,
    level: logLevel
  }

  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    const optsGCPLogging = {
      projectId: process.env.GCP_PROJECT_ID || 'chomchob-sys',
      logName: 'tyk-updater',
      prefix: name,
      labels: {
        name: _package.name,
        version: _package.version,
        env: process.env.NODE_ENV || 'local'
      }
    }
    if (process.env.HOSTNAME) {
      optsGCPLogging.labels['pod-name'] = process.env.HOSTNAME
    }

    logger = new winston.Logger({
      level: logLevel,
      transports: [
        new winston.transports.Console(optsConsole),
        // Creates a Winston Stackdriver Logging client
        new LoggingWinston(optsGCPLogging)
      ],
      exitOnError: false
    })
  } else {
    logger = new winston.Logger({
      level: logLevel,
      transports: [
        new winston.transports.Console(optsConsole)
        // Creates a Winston Stackdriver Logging client
        // new LoggingWinston(optsGCPLogging)
      ],
      exitOnError: false
    })
  }

  return logger
}
