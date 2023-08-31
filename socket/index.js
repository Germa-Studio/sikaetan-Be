const socketIo = require('socket.io')
const { Op } = require('sequelize');
const { Message, dataPerson, chat, chatDataPerson, sequelize, attachment } = require('../app/models')

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
      const chatters = await getChatters(user.chatId, user.id) 
        if(users.has(chatters)) {
            console.log("masuk")
            io.to(socket.id).emit('online', {'status':'online'})
        }else{
            console.log("masuk")
            io.to(socket.id).emit('online', {'status':'offline'})
        }
    })
    socket.on('message', async (message) => {
      let sockets = []
  
      if (users.has(message.fromUserId)) {
        sockets = users.get(message.fromUserId).sockets
      }
  
      message.toUserId.forEach(id => {
        if (users.has(id)) {
          sockets = [...sockets, ...users.get(id).sockets]
        }
      }) 
      const t = await sequelize.transaction()
      try {
        const msg = {
          type: message.type,
          fromId: message.fromId,
          chatId: message.chatId,
          message: message.message
        }
        const savedMessage = await Message.create(msg, { transaction: t })
        if(savedMessage){
        const messages = await message.findAll({where:{id:savedMessage.id},
          include: {
            model: attachment,
            attributes: ['link'] 
          }
        })
        if(message){
           await t.commit()
           sockets.forEach(socket => {
             io.to(socket).emit('received', messages)
           })
        }
        }else{
          await t.rollback()
          const a =  users.get(message.fromUserId).sockets
            io.to(a).emit('received', {message:"gagal mengirim pesan"})
        }
  
      } catch (e) { 

      }
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
  return result.dataPersonId
  } catch (error) {
    console.log(error)
    return {}
  }
}
module.exports = SocketServer
