const express = require('express');
const http = require('http');
const websocket = require('ws');
const moment = require('moment');

const app = express();
// 设置 静态资源请求路径
app.use('/node_modules/', express.static(__dirname + '/node_modules/'));
app.set('view engine', 'ejs');
// 监听普通的 http 请求
app.get('/', function(req, res) {
    res.render('index');
});

var server = http.createServer(app);
var wss = new websocket.Server({ server });
var wsCount = 0;

// 有新的客户端连接进来
wss.on('connection', function(ws, req) {
    wsCount++;
    // 客户端的Ip地址
    var ip = req.connection.remoteAddress;
    ws.ip = ip;
    wss.broadcast({
        type: 1, // 系统消息
        username: '服务器消息',
        msg: '欢迎用户' + ip + '进入聊天室！'
    });

    ws.on('close', function(ws) {
        wsCount--;
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
    // 循环发送消息
    wss.clients.forEach(client => {
        if (client.readyState === websocket.OPEN) {
            client.send(JSON.stringify(msgObj));
        }
    });
}


server.listen(3000, function() {
    console.log('server running at http://127.0.0.1:3000');
});