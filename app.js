const express = require('express');
const http = require('http');
const websocket = require('ws');
const moment = require('moment');
var escape_goat = require('escape-goat');

const app = express();
// 设置 静态资源请求路径
app.use('/node_modules/', express.static(__dirname + '/node_modules/'));
// 设置模板引擎
app.set('view engine', 'ejs');
// 监听普通的 http 请求
app.get('/', function(req, res) {
    res.render('index');
});

// 创建一个 express 服务器，专门接收 普通请求
var server = http.createServer(app);
// 创建一个 websocket 服务，专门接收 websocket 相关的请求
var wss = new websocket.Server({ server });
// 定义当前在线的人数
var wsCount = 0;

// 有新的客户端连接进来
wss.on('connection', function(ws, req) {
    wsCount++;
    // 客户端的Ip地址
    var ip = req.connection.remoteAddress;
    // 将每个客户端的Ip，保存到当前客户端身上，方便读取
    ws.ip = ip;
    wss.broadcast({
        type: 1, // 系统消息
        username: '服务器消息',
        msg: '欢迎用户' + ip + '进入聊天室！'
    });

    // websocket 收消息的事件
    ws.on('message', function(message) {
        var msgObj = JSON.parse(message);
        wss.broadcast({
            username: msgObj.username,
            msg: msgObj.message
        });
    });

    // websocket 关闭时候的事件
    ws.on('close', function() {
        // 让当前的在线人数 -1
        wsCount--;
        // 通知下线消息
        wss.broadcast({
            type: 1,
            username: '服务器消息',
            msg: '用户' + this.ip + '已下线！'
        });
    });
});

// 向所有的客户端发送消息
wss.broadcast = function(msgObj) {
    // 发送消息的时间
    if (!msgObj.timestamp) {
        msgObj.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    }
    // type 表示发送的消息类型：1 表示系统消息； 2 表示用户消息
    if (!msgObj.type) {
        msgObj.type = 2; // 如果没有传递，则默认是用户消息
    }
    // 当前连接进来的用户个数
    msgObj.wsCount = wsCount;
    // 对用户名和消息进行转码
    msgObj.username = escape_goat.escape(msgObj.username);
    msgObj.msg = escape_goat.escape(msgObj.msg);
    // 循环发送消息
    wss.clients.forEach(client => {
        if (client.readyState === websocket.OPEN) {
            client.send(JSON.stringify(msgObj));
        }
    });
}

// 监听 3000 端口
server.listen(3000, function() {
    console.log('server running at http://127.0.0.1:3000');
});