const { Op } = require('sequelize')
const { dataPerson, Chat, ChatUser, Message, sequelize } = require('../models')

exports.index = async (req, res) => {

  const user = await dataPerson.findOne({
    where: {
      id: req.user?.id
    },
    include: [
      {
        model: Chat,
        include: [
          {
            model: dataPerson,
            where: {
              [Op.not]: {
                id: req.user?.id
              }
            }
          },
          {
            model: Message,
            include: [
              {
                model: dataPerson
              }
            ],
            limit: 20,
            order: [['id', 'DESC']]
          }
        ]
      }
    ]
  })

  // console.log(user.Chats)

  return res.send(user.Chats)
}

exports.create = async (req, res) => {

  const { partnerId } = req.body

  const t = await sequelize.transaction()

  try {

    const user = await dataPerson.findOne({
      where: {
        id: req.user.id
      },
      include: [
        {
          model: Chat,
          where: {
            type: 'dual'
          },
          include: [
            {
              model: ChatUser,
              where: {
                userId: partnerId
              }
            }
          ]
        }
      ]
    })

    if (user && user.Chats.length > 0)
      return res.status(403).json({ status: 'Erro', message: 'Chat with this user already exist!' })

    const chat = await Chat.create({ type: 'dual' }, { transaction: t })

    await ChatUser.bulkCreate([
      {
        chatId: chat.id,
        userId: req.user.id,
      },
      {
        chatId: chat.id,
        userId: partnerId,
      }
    ], { transaction: t })

    await t.commit()

    // const newChat = await Chat.findOne({
    //   where: {
    //     id: chat.id
    //   },
    //   include: [
    //     {
    //       model: dataPerson,
    //       where: {
    //         [Op.not]: {
    //           id: req.user.id
    //         }
    //       }
    //     },
    //     {
    //       model: Message
    //     }
    //   ]
    // })


    const creator = await dataPerson.findOne({
      where: {
        id: req.user.id
      }
    })

    const partner = await dataPerson.findOne({
      where: {
        id: partnerId
      }
    })

    const forCreator = {
      id: chat.id,
      type: 'dual',
      Users: [partner],
      Messages: []
    }

    const forReceiver = {
      id: chat.id,
      type: 'dual',
      Users: [creator],
      Messages: []
    }

    return res.json([forCreator, forReceiver])

  } catch (e) {
    await t.rollback()
    return res.status(500).json({ status: 'Error', message: e.message })
  }
}

exports.messages = async (req, res) => {
  const limit = 10
  const page = req.query.page || 1
  const offset = page > 1 ? page * limit : 0

  const messages = await Message.findAndCountAll({
    where: {
      chatId: req.query.id
    },
    include: [
      {
        model: dataPerson
      }
    ],
    limit,
    offset,
    order: [['id', 'DESC']]
  })

  const totalPages = Math.ceil(messages.count / limit)

  if (page > totalPages) return res.json({ data: { message: [] } })

  const result = {
    messages: messages.rows,
    pagination: {
      page,
      totalPages
    }
  }

  return res.json(result)
}

exports.deleteChat = async (req, res) => {

  const { id } = req.params

  try {
    const chat = await Chat.findOne({
      where: {
        id
      },
      include: [
        {
          model: dataPerson
        }
      ]
    })

    const notifyUsers = chat.Users.map(user => user.id)

    await chat.destroy()
    return res.json({ chatId: id, notifyUsers })

  } catch (e) {
    return res.status(500).json({ status: 'Error', message: e.message })
  }
}

exports.imageUpload = (req, res) => {
  if (req.file) {
    return res.json({ url: req.file.filename })
  }

  return res.status(500).json('No image uploaded')
}

exports.addUserToGroup = async (req, res) => {
  try {

    const { chatId, userId } = req.body

    const chat = await Chat.findOne({
      where: {
        id: chatId
      },
      include: [
        {
          model: dataPerson,
        },
        {
          model: Message,
          include: [
            {
              model: dataPerson
            }
          ],
          limit: 20,
          order: [['id', 'DESC']]
        }
      ]
    })

    chat.Messages.reverse()

    // check if already in the group
    chat.Users.forEach(user => {
      if (user.id === userId) {
        return res.status(403).json({ message: 'dataPerson already in the group!' })
      }
    })

    await ChatUser.create({ chatId, userId })

    const newChatter = await dataPerson.findOne({
      where: {
        id: userId
      }
    })

    if (chat.type === 'dual') {
      chat.type = 'group'
      chat.save()
    }

    return res.json({ chat, newChatter })

  } catch (e) {
    return res.status(500).json({ status: 'Error', message: e.message })
  }
}

exports.leaveCurrentChat = async (req, res) => {

  try {
    const { chatId } = req.body
    const chat = await Chat.findOne({
      where: {
        id: chatId
      },
      include: [
        {
          model: dataPerson
        }
      ]
    })

    if (chat.Users.length === 2) {
      return res.status(403).json({ status: 'Error', message: 'You cannot leave this chat' })

    }

    if (chat.Users.length === 3) {
      chat.type = 'dual'
      chat.save()
    }

    await ChatUser.destroy({
      where: {
        chatId,
        userId: req.user.id
      }
    })

    await Message.destroy({
      where: {
        chatId,
        fromUserId: req.user.id
      }
    })

    const notifyUsers = chat.Users.map(user => user.id)

    return res.json({ chatId: chat.id, userId: req.user.id, currentUserId: req.user.id, notifyUsers })

  } catch (e) {
    return res.status(500).json({ status: 'Error', message: e.message })
  }
}