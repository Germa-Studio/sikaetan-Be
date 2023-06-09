const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  chat,
  tambahChat,
  rating,
  tambahRating
} = require('../controllers/liveChat');

router.post('/chat/add', auth, tambahChat);
router.post('/rating/add', auth, tambahRating);
router.get('/chat', auth, chat);
router.get('/rating', auth, rating);

module.exports = router;