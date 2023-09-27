const socketIo = require('socket.io')
const { Op } = require('sequelize');
const { message: messagesss , dataPerson, chat, chatDataPerson, sequelize, attachment } = require('../app/models')
const imageKit = require('../midleware/imageKit');
const users = new Map()
const userSockets = new Map()

const SocketServer = (server) => {
  const io = socketIo(server)

  io.on('connection', (socket) => {
    console.log("connected")
    socket.on('join', async (user) => {
      console.log(user,"<<<user")
      let sockets = []

      if (users.has(user.id)) {
        const existingUser = users.get(user.id)
        existingUser.sockets = [...existingUser.sockets, ...[socket.id]]
        users.set(user.id, existingUser)
        sockets = [...existingUser.sockets, ...[socket.id]]
        userSockets.set(socket.id, user.id)
      } else {
        users.set(user.id, { id: user.id, sockets: [socket.id] })
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
      console.log(users,"<<<user")
      let sockets = []
  
      if (users.has(message.fromId)) {
        sockets = users.get(message.fromId).sockets
      }
        console.log(users.get(message.fromId).sockets, "<<<< users by fromId")
      if (users.has(message.toUserId)) {
        sockets = [...sockets, ...users.get(message.toUserId).sockets]
      }
      const t = await sequelize.transaction()
      try {
       let urlImg
        if (message.image) {
          const {image} = message 
          const validFormat =
            image.mimetype === 'image/png' ||
            image.mimetype === 'image/jpg' ||
            image.mimetype === 'image/jpeg' ||
            image.mimetype === 'image/gif';
          if (!validFormat) {
            res.status(400).json({
              status: 'failed',
              message: 'Wrong Image Format',
            });
          }
          const split = image.originalname.split('.');
          const ext = split[split.length - 1];

          // upload file ke imagekit
          const img = await imageKit.upload({
            file: file.buffer,
            fileName: `IMG-${Date.now()}.${ext}`,
          });
          urlImg = img.url
        }
        const msg = {
          fromId: message.fromId,
          chatId: message.chatId,
          pesan: message.message,
          waktu: message.waktu,
          attachment: urlImg
        }
        const savedMessage = await messagesss.create(msg, { transaction: t })
        console.log(savedMessage.id, "<<<<< berhasil menambahkan message")
        const messages = await messagesss.findOne({where:{id:savedMessage.id}, transaction: t})
        console.log(messages, "<<<<<messages")
        if(messages){
           await t.commit()
           console.log(sockets)
           sockets.forEach(socket => {
             io.to(socket).emit('received', messages)
           })
        }
      } catch (e) { 
        console.log(e.message)
          await t.rollback()
          const a =  users.get(message.fromId).sockets
          io.to(a).emit('received', {message:"gagal mengirim pesan"})
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
  console.log(result.dataPersonId)
  return result.dataPersonId
  } catch (error) {
    console.log(error)
    return {}
  }
}
module.exports = SocketServer
