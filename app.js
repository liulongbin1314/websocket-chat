const express = require('express');
const http = require('http');
const ws = require('ws');

const app = express();
// 设置 静态资源请求路径
app.use('/node_modules/', express.static(__dirname + '/node_modules/'));
app.set('view engine', 'ejs');
// 监听普通的 http 请求
app.get('/', function(req, res) {
    res.render('index');
});

var server = http.createServer(app);
var wss = new ws.Server({ server });


server.listen(3000, function () {
    console.log('server running at http://127.0.0.1:3000');
});