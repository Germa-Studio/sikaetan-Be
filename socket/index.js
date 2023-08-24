const socketIo = require('socket.io')
const { Op } = require('sequelize');
const { sequelize } = require('../app/models')
const { Message, dataPerson, chat, chatDataPerson } = require('../app/models')

const users = new Map()
const userSockets = new Map()

const SocketServer = (server) => {
  const io = socketIo(server)

  io.on('connection', (socket) => {
    console.log("connected")
    socket.on('join', async (user) => {
      console.log("connected join")
      let sockets = []

      if (users.has(user.id)) {
        const existingUser = users.get(user.id)
        existingUser.sockets = [...existingUser.sockets, ...[socket.id]]
        users.set(user.id, existingUser)
        sockets = [...existingUser.sockets, ...[socket.id]]
        userSockets.set(socket.id, user.id)
      } else {
        users.set(user.id, { id: user.id, sockets: [] })
        sockets.push(socket.id)
        userSockets.set(socket.id, user.id)
      }

      // {
      //   id,
      //   chatId,
      // }
      const chatters = await getChatters(user.chatId, user.id) //query 

      // console.log(chatters)

      // notify his friends that user is now online
        if(users.has(chatters)) {
          const chatter = users.get(chatters)
          chatter.sockets.forEach(socket => {
            try {
              io.to(socket).emit('online', user)
            } catch (error) { }
          })
          onlineFriends.push(chatter.id)
        }

      // send to user sockets which of his friends are online
      sockets.forEach(socket => {
        try {
          io.to(socket).emit('friends', onlineFriends)
          // console.log(user)
        } catch (error) { }
      })
    })

  })
}

const getChatters = async (chatId, userId) => {
  try {
  const result = await chatDataPerson.findOne({
    where: {
      chatId,
      dataPersonId: {
        [Op.not]: userId
      }
    },
    attributes: ['dataPersonId']
  });
  console.log(result)
  return result
  } catch (error) {
    console.log(error)
    return {}
  }
}
module.exports = SocketServer
