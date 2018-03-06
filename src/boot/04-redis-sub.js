const config = require('../config')()
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.Multi.prototype)
bluebird.promisifyAll(redis.RedisClient.prototype)

const { reloadConfig } = require('../reload-config')

const logger = global.logger

const $ = module.exports

// from 'redis_signal.go' in https://github.com/TykTechnologies/tyk
const RedisPubSubChannel = 'tyk.cluster.notifications'
const UpdateCmds = [
  'ApiUpdated',
  'ApiRemoved',
  'ApiAdded',
  'GroupReload',
  'PolicyChanged'
]

$._client = null

$.init = async () => {
  const opts = {
    // host: config.redis.host,
    // port: config.redis.port
  }
  opts.url = `redis://`
  if (config.redis.password) {
    opts.password = config.redis.password
    opts.url += `:${config.redis.password}@`
  }
  opts.url += `${config.redis.host}:${config.redis.port}`
  $._client = redis.createClient(opts)
  $._client.on('message', (ch, msg) => {
    const cmd = JSON.parse(msg)
    if (UpdateCmds.includes(cmd.command)) {
      logger.info('got reload signal')
      return reloadConfig()
    }
  })
  $._client.subscribe(RedisPubSubChannel)
}

$.exit = async () => {
  $._client.unsubscribe()
  $._client.quit()
  logger.info(`redis disposed`)
}
