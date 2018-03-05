const router = require('cc-router')
// const ev = require('express-validation')
const logger = require('../logger')('express-js')
const bodyParser = require('body-parser')
const morgan = require('morgan')

// function inputValidateErrorHandler (err, req, res) {
//   const data = {
//     success: false,
//     msg: err.message,
//     errors: err.errors
//   }
//   return res.status(err.status).json(data)
// }

module.exports = (app) => {
  // init morgan
  const format = 'combined'
  const opts = {
    stream: {
      write: (msg) => logger.info(msg)
    },
    skip: req => (['/health', '/'].includes(req.originalUrl))
  }
  app.use(morgan(format, opts))

  // init body-parser
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // init rounting
  const rootDir = __dirname
  const routesDir = '../routes'
  const middlewaresDir = '../route-middlewares'
  router(app, rootDir, routesDir, middlewaresDir)

  // 404 handler
  app.use((req, res) => res.status(404).json({ success: false, msg: 'not found' }))

  // error handler
  app.use((err, req, res, next) => {
    // if (err instanceof ev.ValidationError) {
    //   return inputValidateErrorHandler(err, req, res, next)
    // }

    // other type of errors, it *might* also be a Runtime Error
    logger.error(err.message, err)

    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({
        success: false,
        msg: err.message,
        stack: err.stack.split(/\n\s*/),
        errors: err
      })
    }

    return res.status(500).json({ success: false, msg: 'internal error' })
  })
}
