const upload = require('../config/multer');
const uploadSingle = upload.single('image');
module.exports = { uploadSingle };