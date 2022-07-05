const express = require('express')
const app = express()
const path = require('path')
const router = require('./router')
// const http = require('http')
// const fileUpload = require('express-fileupload')
// const chokidar = require('chokidar')
// const consola = require('consola')
// const { Server } = require('socket.io')

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

// const server = http.createServer(app)
// const io = new Server(server)
// const port = [9000, 8000, 7000]
// let i = 0
// let watchCallback
// io.on('connection', (socket) => {
//   if (!watchCallback) {
//     consola.info('[xdoc] socket connected')
//     watchCallback = (event, file) => {
//       consola.info(`[xdoc] file watch [${event}] ${path.relative(process.cwd(), file)}`)
//       io.emit('data', { event, path: file })
//     }
//     watch(process.cwd(), watchCallback)
//   }
// })
// io.on('disconnect', () => {
//   consola.info('[xdoc] user disconnected')
// })

// server.listen(port[i], function () {
//   // open(`http://localhost:${port[i]}`)
//   consola.success(`[xdoc] app listening on port http://localhost:${port[i]}`)
// })

// server.on('error', () => {
//   i += 1
//   if (i >= port.length) {
//     consola.error('端口被占用')
//     return
//   }
//   setTimeout(() => server.listen(port[i]), 1000)
// })
//
// function watch (root, cb) {
//   const _cb = (event, path) => {
//     if (path.endsWith('.md')) {
//       // 发送消息给前端刷新
//       cb && cb(event, path)
//     }
//   }
//   chokidar.watch(
//     ['src', 'server', 'README.md', 'packages']
//       .map(x => x.endsWith('.md') ? path.join(root, x) : path.join(root, x, '**', '*.md')),
//     {
//       persistent: true,
//       ignored: /node_modules|^\.|tests/
//     }
//   ).on('all', _cb)
// }
