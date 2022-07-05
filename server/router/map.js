const controller = require('../controller')
const path = require('path')

module.exports = {
  '/': {
    get: async (req, res) => {
      res.sendFile('index.html', {
        root: path.join(__dirname, '../public/'),
        headers: {
          'x-timestamp': Date.now(),
          'x-sent': true
        }
      })
    }
  },

  '/xprocess/list': {
    get: async (req, res) => {
      const data = await controller.getList(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  },

  '/xprocess/detail': {
    get: async (req, res) => {
      const data = await controller.getDetail(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  },

  '/xprocess/save': {
    post: async (req, res) => {
      const data = await controller.save(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  },

  '/xprocess/delete': {
    post: async (req, res) => {
      const data = await controller.delete(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  }
}
