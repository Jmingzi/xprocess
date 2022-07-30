const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')
const db = new JsonDB(new Config('xprocess-db', true, false, '/'))

module.exports = {
  async getList (req) {
    const { uid } = req.query
    if (!uid) {
      return 'uid 为空'
    }
    try {
      return db.getData(`/process/${uid}`)
    } catch (e) {
      return []
    }
  },

  async getUserList () {
    try {
      return db.getData('/process/users')
    } catch (e) {
      return {}
    }
  },

  async userSave (req) {
    db.push(`/process/users/${req.body.id}`, req.body)
    return req.body
  },

  async getDetail (req) {
    const { uid, id } = req.query
    if (!uid) {
      return 'uid 为空'
    }
    try {
      const obj = db.getData(`/process/${uid}/${id}`)
      return obj
    } catch (e) {
      return null
    }
  },

  async delete (req) {
    const { uid, id } = req.body
    if (!uid) {
      return 'uid 为空'
    }
    return db.delete(`/process/${uid}/${id}`)
  },

  async save (req) {
    const { uid, id } = req.body
    if (!uid) {
      return 'uid 为空'
    }
    let file = `/process/${uid}`
    if (id) {
      file += `/${id}`
      // 修改
      db.push(file, req.body)
    } else {
      // 新增
      const id = Date.now()
      file += `/${id}`
      db.push(file, Object.assign(req.body, { id }))
    }
    return db.getData(file)
  },

  async fileImgSave (req) {
    const { uid, id } = req.body
    const file = `/process/img/${uid}/${id}`
    db.push(file, req.body)
    return req.body
  },

  async fileImgGet (data) {
    const { uid, id } = data
    const file = `/process/img/${uid}/${id}`
    const fileData = db.getData(file)
    const detail = await this.getDetail({ query: data })
    return Object.assign({}, fileData, detail)
  }
}
