let express = require('express');
let router = express.Router();
let upload = require('./util/upload');
let login = require('./routes/login');
let user = require('./routes/user');

router.get('/', (req, res) => {res.send('Hello World!');});
router.post('/login', login.userLogin);
router.post('/register', login.userRegister);
// 查询用户信息
router.post('/user/show/userinfo', user.showUserInfo);
// 上传图片
router.post('/upload', upload.uploadparams, upload.uploadImg)
// 修改头像
router.post('/user/update/avatar', user.updateAvatar);
// 修改用户信息
router.post('/user/update/userinfo', user.updateUserInfo);
// 改绑邮箱
router.post('/user/update/email', user.updateEmail);
// 修改密码
router.post('/user/update/pwd', user.updatePwd);
// 注销账户
router.post('/user/delete/user', user.deleteAccount);

module.exports = router;