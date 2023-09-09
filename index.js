const express = require('express')
const config = require('./config/app')
const router = require('./app/router')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const http = require('http')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(router)
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/uploads'))

const port = config.appPort

const server = http.createServer(app)
const SocketServer = require('./socket')
SocketServer(server)

server.listen(port,'0.0.0.0', () => {
    console.log(`Server listening on port ${port}, http://localhost:3001`);
})