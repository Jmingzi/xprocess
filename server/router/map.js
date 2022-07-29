const controller = require('../controller')
const fs = require('fs')
const path = require('path')
const { request } = require('urllib')

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
  },

  '/xprocess/userList': {
    get: async (req, res) => {
      const data = await controller.getUserList(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  },

  '/xprocess/userSave': {
    post: async (req, res) => {
      const data = await controller.userSave(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  },

  '/xprocess/fileimg': {
    post: async (req, res) => {
      const data = await controller.fileImgSave(req)
      const success = typeof data !== 'string'
      res.json({ success, data })
    },

    get: async (req, res) => {
      const data = await controller.fileImgGet(req.query)
      const success = typeof data !== 'string'
      res.json({ success, data })
    }
  },

  '/xprocess/img/:uid/:id': {
    get: async (req, res) => {
      const data = await controller.fileImgGet(req.params)
      const imgRes = await request(data.img, {
        streaming: true
      })
      imgRes.res.on('data', d => {
        res.write(d)
      })
      imgRes.res.on('end', () => {
        res.status(200)
        res.end()
      })
    }
  }
}
