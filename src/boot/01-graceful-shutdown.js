// const DEBUG_DELAY = 2000                  // just for demonstrate that it really doesn't receive requests after 4s
const logger = global.logger
// const READINESS_PROBE_DELAY = 1000 // failureThreshold: 2, periodSeconds: 2 (4s)

const $ = module.exports

$._isShutingDown = false

// Graceful stop
async function gracefulStop () {
  logger.info(`Server is shutting down...`)

  // Don't bother with graceful shutdown on development to speed up round trip
  // if (!process.env.NODE_ENV) return process.exit(1)

  try {
    // shutdown mainApp

    // await Promise.delay(5000)
    logger.info(`Successful graceful shutdown`)
    process.exit(0)
  } catch (e) {
    logger.error(`Error happened during graceful shutdown`, e)
    process.exit(1)
  }
}

function onSignal (app = false) {
  if (!$._isShutingDown) {
    logger.info(`Got a signal. Graceful shutdown start`)

    $._isShutingDown = true
    if (app) {
      app.locals.isExit = true
    }
    setTimeout(gracefulStop, 0)
  }
}

$.gracefulShutdown = onSignal
$.isShutingDown = () => ($._isShutingDown)

$.init = (app) => {
  process.on('SIGTERM', onSignal.bind(null, app))
  process.on('SIGINT', onSignal.bind(null, app))
  logger.debug('graceful-shutdown initiated')
}
