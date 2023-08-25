const router = require('express').Router()
const {
  getContactPenyuluh,
  getContactPetani,
  getMessagePetani 
} = require('../controllers/chatt')
const auth  = require('../../midleware/auth')

router.get('/chat/messages/penyuluh', auth, getContactPenyuluh)
router.get('/chat/petani/:id', auth, getContactPetani)
router.get('/chat/msesages/petani', auth, getMessagePetani)

module.exports = router
