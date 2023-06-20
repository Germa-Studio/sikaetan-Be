const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
  usersAll
} = require('../controllers/users');

router.get('/users', auth, usersAll);

module.exports = router;

