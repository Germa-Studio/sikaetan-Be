const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const router = require('./app/router');
const http = require('http')
const { Server } = require('socket.io')

const app = express();

app.use(morgan('common'));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());
app.use(express.json());
app.use(router);

const server = http.createServer(app)
const Io = new Server(server)

module.exports = { server, Io};