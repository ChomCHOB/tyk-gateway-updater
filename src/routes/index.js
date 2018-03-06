const { reloadConfig } = require('../reload-config')

const reloadConfigApi = async (req, res) => {
  await reloadConfig()
  res.json({ success: true, msg: 'reloaded' })
}

const __ = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next)
  }

module.exports = [
  {
    method: 'get',
    path: '/',
    handler: __(async (req, res) => {
      return res.json({ success: true, msg: 'success' })
    })
  },
  {
    method: 'post',
    path: '/reload',
    handler: __(reloadConfigApi)
  }
]
