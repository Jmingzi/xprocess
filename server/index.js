const express = require('express')
const app = express()
const path = require('path')
const router = require('./router')

// app.use(fileUpload({
//   limits: { fileSize: 0.9 * 1024 * 1024 },
// }))
app.use(express.json())
app.use('/', express.static(path.resolve(__dirname, './public')))
//  使用路由 /index 是路由指向名称
app.use(router)

const port = 9527
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
