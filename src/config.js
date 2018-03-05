module.exports = () => ({
  name: process.env.APP_NAME || 'tyk-gateway-updater',
  bindPort: Number(process.env.BIND_PORT) || 3000,
  bindIp: process.env.BIND_IP || '0.0.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
  mongodb: {
    host: process.env.MONGODB_HOST || '127.0.0.1',
    port: process.env.MONGODB_PORT || 27017,
    dbName: process.env.MONGODB_DBNAME || 'tyk_analytics',
    user: process.env.MONGODB_USER,
    passwd: process.env.MONGODB_PASSWD
  },
  policyEnabled: String(process.env.POLICY_ENABLED).toLowerCase() === 'true',
  policyColName: process.env.POLICY_COLLECTION_NAME || 'tyk_policies',
  apiEnabled: String(process.env.API_ENABLED).toLowerCase() === 'true',
  apiColName: process.env.API_COLLECTION_NAME || 'tyk_apis',
  // onlyTags: process.env.ONLY_TAGS || '',
  containTags: process.env.CONTAIN_TAGS || '',
  notContainTags: process.env.NOT_CONTAIN_TAGS || '',
  tmpDir: process.env.TMP_DIR || '/tmp/tyk-gateway/',
  tyk: {
    port: process.env.TYK_PORT || '8080',
    apiKey: process.env.TYK_API_KEY,
    appsDirPath: process.env.TYK_APPS_DIR_PATH || '/tmp/tyk-gateway/apps',
    policiesDirPath: process.env.TYK_POLICIES_DIR_PATH || '/tmp/tyk-gateway/policies',
    policiesFileName: process.env.TYK_POLICIES_FILE_NAME || 'policies.json'
  }
})
