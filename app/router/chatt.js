const router = require('express').Router()
const { index, create, messages, deleteChat, imageUpload, addUserToGroup, leaveCurrentChat } = require('../controllers/chatt')
const { auth } = require('../../midleware/auth')
const { chatFile } = require('../../midleware/fileupload')

router.get('/chat', [auth], index)
router.get('/chat/messages', [auth], messages)
router.post('/chat/create', [auth], create)
router.post('/chat/upload-image', [auth, chatFile], imageUpload)
router.post('/chat/add-user-to-group', auth, addUserToGroup)
router.post('/chat/leave-current-chat', auth, leaveCurrentChat)
router.delete('/chat/:id', [auth], deleteChat)

module.exports = router
