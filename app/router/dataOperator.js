const router = require('express').Router();
const auth = require('../../midleware/auth');
const upload = require('../../midleware/uploader');
const {
    tambahDataOperator,
    getDaftarOperator,
    deleteDaftarOperator,
    getOperatorDetail,
    updateOperatorDetail,
    uploadDataOperator,
    } = require('../controllers/dataOperator');

router.get(
    '/daftar-operator'
    , auth
    , getDaftarOperator
);
router.get(
    '/daftar-operator/:id'
    , auth
    , getOperatorDetail
);
router.post(
    '/daftar-operator/add'
    , auth
    , upload.single('foto') 
    ,tambahDataOperator
);
router.put(
    '/daftar-operator/:id'
    , auth
    , upload.none()
    , updateOperatorDetail
);
router.delete(
    '/daftar-operator/:id'
    , auth
    , deleteDaftarOperator
); 
router.post(
    '/upload-data-operator'
    , auth
    , upload.single("file")
    , uploadDataOperator
);
module.exports = router;
