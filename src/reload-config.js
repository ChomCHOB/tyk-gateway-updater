const logger = global.logger
const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const MongoClient = require('mongodb').MongoClient
const slug = require('slug')
const _ = require('lodash')
// const shell = require('shelljs')
const rp = require('request-promise')

const config = require('./config')()

const $ = module.exports

$._createApis = async (docs) => {
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i]
    // if (doc.slug ===)
    delete doc._id
    const versions = doc.version_data.versions
    delete doc.version_data.versions
    doc.version_data.versions = {}

    _.forOwn(versions, version => {
      const base64Name = version.name
      const decodeName = Buffer.from(base64Name, 'base64').toString()
      version.name = decodeName
      doc.version_data.versions[decodeName] = version
    })

    // write file
    const apiSlugName = slug(doc.name)
    // const tmpDir = (path.isAbsolute(config.tmpDir))
    //   ? config.tmpDir
    //   : path.join(process.cwd(), config.tmpDir)
    const filePath = path.join(config.tyk.appsDirPath, `${apiSlugName}.json`)
    try {
      fs.writeFileSync(filePath, JSON.stringify(doc, null, 2))
    } catch (e) {
      logger.error(`cannot write '${apiSlugName}.json' to file`, e)
    }
  }
}

$._createPolicies = async (docs) => {
  const policies = {}
  for (let i = 0; i < docs.length; i++) {
    const policy = docs[i]
    delete policy._id
    policy.name = slug(policy.name)
    policies[policy.name] = policy
  }
  // const tmpDir = (path.isAbsolute(config.tmpDir))
  //   ? config.tmpDir
  //   : path.join(process.cwd(), config.tmpDir)
  const filePath = path.join(config.tyk.policiesDirPath, `${config.tyk.policiesFileName}`)
  try {
    fs.writeFileSync(filePath, JSON.stringify(policies, null, 2))
  } catch (e) {
    logger.error(`cannot write '${config.tyk.policiesFileName}' to file`, e)
  }
}

/**
 * load config from MongoDB and save to files
 */
$._loadConfig = async () => {
  const collections = []
  if (config.apiEnabled) {
    logger.verbose(`api enabled`)
    collections.push(config.apiColName)
  }
  if (config.policyEnabled) {
    logger.verbose(`policy enabled`)
    collections.push(config.policyColName)
  }

  let promises = {}
  let mongodbUrl = 'mongodb://'
  if (config.mongodb.user && config.mongodb.password) {
    mongodbUrl += `${config.mongodb.user}:${config.mongodb.password}@`
  }
  mongodbUrl += `${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.dbName}`
  logger.debug(`mongodbUrl: ${mongodbUrl}`)
  logger.debug(collections)

  collections.forEach(c => {
    promises[c] = (async () => {
      const client = await MongoClient.connect(mongodbUrl)
      const db = client.db(config.mongodb.dbName)
      const collection = db.collection(c)
      const query = {
        active: true
      }
      const docs = await collection.find(query).toArray()
      logger.debug(`Load collection '${c}' got ${docs.length} rows`)

      client.close()

      // TODO: filter by tags befor return

      return docs
    })()
  })

  let result = await Promise.props(promises)

  // save config to files
  if (config.apiEnabled) {
    await $._createApis(result[config.apiColName])
  }
  if (config.policyEnabled) {
    await $._createPolicies(result[config.policyColName])
  }
}

/**
 * request to tyk for reload config
 */
$._reloadTyk = async () => {
  await rp({
    method: 'get',
    url: `http://127.0.0.1:${config.tyk.port}/tyk/reload?block=true`,
    headers: {
      'X-Tyk-Authorization': config.tyk.apiKey
    }
  })
}

$.reloadConfig = async () => {
  if ('_isLoading' in $ && $._isLoading) {
    logger.verbose('still loading, ignored the request to reload config')
    return
  }
  $._isLoading = true

  try {
    await $._loadConfig()

    // reload tyk
    await $._reloadTyk()
  } catch (e) {
    logger.error(`error while reloading tyk`, e)
  } finally {
    $._isLoading = false
  }
}
