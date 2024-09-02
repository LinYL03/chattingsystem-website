let express = require('express');
let app = express();
let http = require('http');
let server = http.createServer(app);
let bodyParser = require('body-parser')
let fs = require('fs');
let path = require('path');
let cookieParser = require('cookie-parser');
let router = require('./router')
//引入cors解决跨域模块
let cors = require('cors');

//日志模块
let logger = require('morgan');
let fileStreamRotator = require('file-stream-rotator');
let logDir = path.join(__dirname, 'log')
fs.existsSync(logDir) || fs.mkdirSync(logDir);
//写入日志信息
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a',
  encoding: 'utf8'
})
var accessLogStream = fileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDir, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})
app.use(logger('combined', { stream: accessLogStream }))

app.use(express.urlencoded({
  extended: false
}));
// 配置解析表单 POST 请求体插件
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(cookieParser());

//静态资源
app.use('/public', express.static(path.join(__dirname, '/public')))
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')))

//为所有源启用跨域
app.use(cors());
// app.use(cors({
//   origin: '*', // 允许所有来源的请求
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的请求方法
//   allowedHeaders: ['Content-Type', 'Authorization'] // 允许的请求头
// }));
//设置跨域访问
// app.all('*', function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By", ' 3.2.1')
//   res.header("Content-Type", "application/json;charset=utf-8");
//   next();
// });

let localIp = 'localhost'; // 默认值
// 获取局域网IP地址并设置为 BASE_URL
const os = require('os');
const networkInterfaces = os.networkInterfaces();
for (const iface in networkInterfaces) {
  for (const alias of networkInterfaces[iface]) {
    if (alias.family === 'IPv4' && !alias.internal) {  // 查找IPv4且非内部地址
      localIp = alias.address; // 找到第一个局域网IP地址
      break;
    }
  }
}

global.BASE_URL = `http://${localIp}:4000`;

// 定义全局域名变量
// global.BASE_URL = 'http://8.129.128.30:4000'
// global.BASE_URL = 'http://localhost:4000'

app.use(router);

//创建socket.io
let io = require('socket.io')(server);
require('./util/socket')(io);

server.listen(4000, '0.0.0.0', function () {
  // console.log("服务器已启动");
  console.log(`服务器已启动在 ${global.BASE_URL}/`);
});